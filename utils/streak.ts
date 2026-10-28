// ─────────────────────────────────────────────────────────────
// utils/streak.ts
// 불씨 스트릭 계산 (앱·위젯이 같은 규칙을 쓰도록 순수 함수로 둔다)
//   - 스트릭은 앱을 연 날이 아니라 불씨를 점화(Hold to Ignite)한 날로 센다.
//   - 불씨 지키기: 하루를 빠뜨려도 주 1회(월~일)는 스트릭을 지켜 준다. (빠진 날은 세지 않는다)
//   - 7/30/100일 마일스톤에 배경·테마를 해금한다. 해금은 최장 기록 기준이라 다시 잠기지 않는다.
//   - 3/14/50일은 보상 없는 중간 마일스톤. 다음 보상까지 멀게 느껴지지 않도록 축하만 해 준다.
// ─────────────────────────────────────────────────────────────

import { toDateString } from "@/utils/date";

export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100] as const;

export type StreakRecord = {
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null; // 스트릭에 들어간 마지막 날 (점화했거나 불씨 지키기로 지킨 날)
  freezeUsedWeek: string | null; // 불씨 지키기를 쓴 주 (그 주 월요일 "YYYY-MM-DD")
};

// "YYYY-MM-DD"를 기기 로컬 시간대의 자정으로 읽는다.
const parseDate = (dateString: string) => {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (dateString: string, days: number) => {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

// 두 날짜 사이의 일수. (서머타임으로 하루가 23·25시간이어도 반올림으로 맞춘다)
export const daysBetween = (from: string, to: string) =>
  Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);

// 그 날짜가 속한 주의 월요일
export const weekKey = (dateString: string) => {
  const day = parseDate(dateString).getDay(); // 0=일 ... 6=토
  return addDays(dateString, -((day + 6) % 7));
};

export const isFreezeAvailable = (record: StreakRecord, date: string) =>
  record.freezeUsedWeek !== weekKey(date);

/**
 * 오늘 기준으로 스트릭이 아직 살아 있는지 맞춘다. (앱을 열 때·위젯을 그릴 때)
 *   - 어제나 오늘까지 이어졌으면 그대로
 *   - 어제 하루만 빠졌고 그 주의 불씨 지키기가 남았으면 어제를 지킨 날로 채운다 (frozenDate)
 *   - 그 외에는 꺼진다 (0)
 */
export const reconcileStreak = (
  record: StreakRecord,
  today: string = toDateString()
): { record: StreakRecord; frozenDate: string | null } => {
  const { currentStreak, lastStreakDate } = record;
  if (currentStreak === 0 || !lastStreakDate) return { record, frozenDate: null };

  const gap = daysBetween(lastStreakDate, today);
  if (gap <= 1) return { record, frozenDate: null };

  const missedDate = addDays(today, -1);
  if (gap === 2 && isFreezeAvailable(record, missedDate)) {
    return {
      record: { ...record, lastStreakDate: missedDate, freezeUsedWeek: weekKey(missedDate) },
      frozenDate: missedDate,
    };
  }
  return { record: { ...record, currentStreak: 0 }, frozenDate: null };
};

/**
 * 오늘 불씨를 점화했다. 이어지고 있으면 +1, 꺼졌으면 1부터 다시 시작한다.
 * 이번 점화로 처음 도달한 마일스톤이 있으면 unlockedMilestone으로 알려 준다.
 */
export const igniteStreak = (
  record: StreakRecord,
  today: string = toDateString()
): { record: StreakRecord; frozenDate: string | null; unlockedMilestone: number | null } => {
  const { record: reconciled, frozenDate } = reconcileStreak(record, today);
  if (reconciled.lastStreakDate === today) return { record: reconciled, frozenDate, unlockedMilestone: null };

  const currentStreak = reconciled.currentStreak > 0 ? reconciled.currentStreak + 1 : 1;
  const longestStreak = Math.max(reconciled.longestStreak, currentStreak);
  const unlockedMilestone =
    STREAK_MILESTONES.find((m) => m === currentStreak && reconciled.longestStreak < m) ?? null;

  return {
    record: { ...reconciled, currentStreak, longestStreak, lastStreakDate: today },
    frozenDate,
    unlockedMilestone,
  };
};

// ── 최근 며칠의 불씨 (나의 모닥불 시트의 주간 기록) ──────────────
// 점화 기록(ignitedDates)을 저장하기 전에 쌓인 날은 기록이 없으므로,
// 가장 오래된 기록보다 앞선 날은 현재 스트릭 구간(마지막 날부터 거꾸로 N일)으로 어림한다.
export type RecentDay = { date: string; lit: boolean; isToday: boolean };

export const getRecentDays = (
  record: Pick<StreakRecord, "currentStreak" | "lastStreakDate">,
  ignitedDates: string[],
  today: string = toDateString(),
  count = 7
): RecentDay[] => {
  const earliest = ignitedDates.length > 0 ? [...ignitedDates].sort()[0] : null;
  const inStreakRange = (date: string) => {
    if (!record.lastStreakDate || record.currentStreak <= 0) return false;
    const back = daysBetween(date, record.lastStreakDate);
    return back >= 0 && back < record.currentStreak;
  };
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(today, i - (count - 1));
    const lit = ignitedDates.includes(date) || ((!earliest || date < earliest) && inStreakRange(date));
    return { date, lit, isToday: date === today };
  });
};

// 다음 마일스톤까지 남은 일수 (모두 달성했으면 null)
export const nextMilestone = (currentStreak: number) => {
  const next = STREAK_MILESTONES.find((m) => m > currentStreak);
  return next ? { milestone: next, daysLeft: next - currentStreak } : null;
};

export const isUnlocked = (unlockAt: number | undefined, longestStreak: number) =>
  !unlockAt || longestStreak >= unlockAt;

// ── 모닥불 단계 ───────────────────────────────────────────────
// 연속 일수가 쌓일수록 장작 위 불이 커지고 늘어난다. (나의 모닥불 시트)
export type CampfireStage = {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  name: string;
  flames: number; // 장작 위 불꽃 개수
  minDays: number; // 이 단계가 시작되는 일수
};

export const CAMPFIRE_STAGES: CampfireStage[] = [
  { level: 0, name: "꺼진 장작", flames: 0, minDays: 0 },
  { level: 1, name: "불씨", flames: 1, minDays: 1 },
  { level: 2, name: "작은 불", flames: 3, minDays: 3 },
  { level: 3, name: "모닥불", flames: 5, minDays: 7 },
  { level: 4, name: "큰 모닥불", flames: 7, minDays: 30 },
  { level: 5, name: "황금 불꽃", flames: 9, minDays: 100 },
];

export const getCampfireStage = (streak: number): CampfireStage =>
  [...CAMPFIRE_STAGES].reverse().find((stage) => streak >= stage.minDays) ?? CAMPFIRE_STAGES[0];

// 불의 세기 0~1. 단계 안에서도 하루하루 조금씩 커지도록 연속 일수에 따라 부드럽게 늘린다. (100일에 최대)
export const campfireIntensity = (streak: number) =>
  streak <= 0 ? 0 : Math.min(1, Math.log(streak + 1) / Math.log(101));

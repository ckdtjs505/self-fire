// ─────────────────────────────────────────────────────────────
// data/widget-snapshot.ts
// 홈 화면 위젯에 보여 줄 데이터(스냅샷).
// 위젯은 앱이 꺼져 있을 때도 그려지므로, 앱이 앞으로 며칠치 '오늘의 명언'과 불씨(스트릭) 정보를 저장해 두고
// 위젯은 그리는 시점의 날짜로 그날 명언과 불씨 상태를 고른다. (자정이 지나면 앱을 열지 않아도 바뀐다)
// ─────────────────────────────────────────────────────────────

import { getDailyQuote } from "@/data/daily-quote";
import { Quote } from "@/models";
import { toDateString } from "@/utils/date";
import { reconcileStreak } from "@/utils/streak";
import { appStorage } from "@/utils/storage";

export const WIDGET_SNAPSHOT_KEY = "widget_snapshot";

// 앱을 열 때마다 다시 채우므로 이 기간 안에 한 번이라도 앱을 열면 위젯 명언이 끊기지 않는다.
export const WIDGET_DAYS_AHEAD = 14;

// picked: 그날 사용자가 고른 오늘의 문장이면 true (위젯 라벨을 '오늘 따르는 문장'으로 바꾼다)
export type WidgetDailyQuote = { date: string; text: string; author: string; picked?: boolean };

export type WidgetSnapshot = {
  quotes: WidgetDailyQuote[];
  currentStreak: number;
  lastStreakDate: string | null; // 스트릭에 들어간 마지막 날 (점화했거나 불씨 지키기로 지킨 날)
  freezeUsedWeek: string | null; // 불씨 지키기를 쓴 주
  lastIgnitedDate: string | null; // 마지막으로 불씨를 지핀(Hold to Ignite) 날
  lastOpenDate?: string | null; // 예전 버전 스냅샷 (앱을 연 날 기준 스트릭)
};

// lit: 오늘 불씨를 지폈다 / waiting: 스트릭은 살아 있지만 오늘은 아직 / out: 꺼졌다 (불씨 지키기로도 못 지킴)
export type FlameStatus = "lit" | "waiting" | "out";

export type WidgetView = {
  // picked: 오늘 고른 오늘의 문장이면 true
  quote: { text: string; author: string; picked?: boolean } | null;
  flame: FlameStatus;
  streak: number; // 지금 이어지고 있는 연속 일수 (꺼졌으면 0)
};

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

// 오늘부터 WIDGET_DAYS_AHEAD일 동안 날짜별 '오늘의 명언'을 담은 스냅샷을 만든다.
// candidates는 홈 화면 '전체' 모드와 같은 후보여야 위젯 명언과 그날 홈 화면의 첫 명언이 같아진다.
// todayPick: 오늘 고른 문장. 있으면 오늘 날짜에는 '오늘의 명언' 대신 이 문장을 담는다. (홈 화면 첫 명언과 같다)
export const buildWidgetSnapshot = (params: {
  candidates: Quote[];
  currentStreak: number;
  lastStreakDate: string | null;
  freezeUsedWeek: string | null;
  lastIgnitedDate: string | null;
  todayPick?: Quote | null;
  now?: Date;
}): WidgetSnapshot => {
  const { candidates, todayPick = null, now = new Date(), ...flame } = params;
  const quotes: WidgetDailyQuote[] = [];
  for (let day = 0; day < WIDGET_DAYS_AHEAD; day++) {
    const date = addDays(now, day);
    const picked = day === 0 && !!todayPick;
    const quote = picked ? todayPick : getDailyQuote(candidates, date);
    if (!quote) continue;
    quotes.push({ date: toDateString(date), text: quote.text, author: quote.author, ...(picked && { picked }) });
  }
  return { quotes, ...flame };
};

// 그리는 시점(now)에 맞는 명언과 불씨 상태를 고른다.
export const resolveWidgetView = (snapshot: WidgetSnapshot | null, now: Date = new Date()): WidgetView => {
  if (!snapshot) return { quote: null, flame: "out", streak: 0 };

  const today = toDateString(now);

  // 저장된 기간이 지났으면(오래 앱을 열지 않음) 마지막 명언이라도 보여 준다.
  const pastOrToday = snapshot.quotes.filter((q) => q.date <= today);
  const daily = pastOrToday[pastOrToday.length - 1] ?? null;
  // 오늘 고른 문장은 그날만 '오늘 따르는 문장'이다. (지난날 고른 문장을 이어 보여 줄 때는 보통 명언으로)
  const quote = daily && { text: daily.text, author: daily.author, picked: !!daily.picked && daily.date === today };

  // 앱과 같은 규칙으로 계산한다. (어제 하루를 빠뜨렸어도 불씨 지키기가 남았으면 이어진 것으로 본다)
  const { record } = reconcileStreak(
    {
      currentStreak: snapshot.currentStreak,
      longestStreak: snapshot.currentStreak,
      lastStreakDate: snapshot.lastStreakDate ?? snapshot.lastOpenDate ?? null,
      freezeUsedWeek: snapshot.freezeUsedWeek ?? null,
    },
    today
  );
  const streak = record.currentStreak;
  const flame: FlameStatus =
    snapshot.lastIgnitedDate === today ? "lit" : streak > 0 ? "waiting" : "out";

  return { quote, flame, streak };
};

export const saveWidgetSnapshot = (snapshot: WidgetSnapshot) =>
  appStorage.setItem(WIDGET_SNAPSHOT_KEY, JSON.stringify(snapshot));

export const loadWidgetSnapshot = async (): Promise<WidgetSnapshot | null> => {
  try {
    const str = await appStorage.getItem(WIDGET_SNAPSHOT_KEY);
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

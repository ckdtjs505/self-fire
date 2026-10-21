// ─────────────────────────────────────────────────────────────
// streak-sheet.tsx — 나의 모닥불
// 스트릭 배지를 누르면 열리는 바텀시트.
//   - 연속 점화 일수만큼 자란 모닥불 (components/campfire.tsx)
//   - 최근 7일 동안 불씨를 지핀 날
//   - 최장 기록 · 불씨 지키기 · 다음 단계까지 남은 일수
//   - 7/30/100일 마일스톤 보상과 진행도
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { getMilestoneRewardNames } from "@/data/streak-rewards";
import { useStreakStore } from "@/store/streak";
import { toDateString } from "@/utils/date";
import {
  CAMPFIRE_STAGES,
  getCampfireStage,
  getRecentDays,
  isFreezeAvailable,
  RecentDay,
  STREAK_MILESTONES,
} from "@/utils/streak";
import { forwardRef } from "react";
import Campfire from "./campfire";
import FeatherIcon, { Ionicon } from "./icon";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import { useShallow } from "zustand/react/shallow";

// 작은 통계 칸 (최장 기록 / 불씨 지키기 / 다음 단계)
const StatCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box flex={1} bg="$surfaceMuted" borderRadius="md" py="md" px="s" alignItems="center" style={{ gap: 4 }}>
    <Text variant="stat" textAlign="center">
      {value}
    </Text>
    <Text variant="caption" fontSize={12} textAlign="center">
      {label}
    </Text>
  </Box>
);

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const weekdayOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(y, m - 1, d).getDay()];
};

// 최근 7일: 불씨를 지핀 날은 불꽃, 아닌 날은 빈 동그라미. 오늘은 테두리로 표시한다.
const RecentDays: React.FC<{ days: RecentDay[] }> = ({ days }) => (
  <Box
    flexDirection="row"
    justifyContent="space-between"
    mt="lg"
    accessible
    accessibilityLabel={`최근 7일 중 ${days.filter((d) => d.lit).length}일 불씨를 지폈어요`}
  >
    {days.map((day) => (
      <Box key={day.date} alignItems="center" style={{ gap: 6 }}>
        <Box
          width={34}
          height={34}
          borderRadius="pill"
          justifyContent="center"
          alignItems="center"
          bg={day.lit ? "$primarySoft" : "$surfaceMuted"}
          borderWidth={day.isToday ? 2 : 0}
          borderColor="$primary"
        >
          {day.lit ? (
            <Ionicon name="flame" size={16} color="$flame" />
          ) : (
            <Box width={6} height={6} borderRadius="pill" bg="$border" />
          )}
        </Box>
        <Text variant="micro" color={day.isToday ? "$foreground" : "$muted"}>
          {day.isToday ? "오늘" : weekdayOf(day.date)}
        </Text>
      </Box>
    ))}
  </Box>
);

// 마일스톤 한 줄: 일수 · 보상 이름 · 진행 막대 (열렸으면 체크)
const MilestoneRow: React.FC<{ milestone: number; currentStreak: number; unlocked: boolean }> = ({
  milestone,
  currentStreak,
  unlocked,
}) => {
  const progress = unlocked ? 1 : Math.min(currentStreak / milestone, 1);
  return (
    <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
      <Box
        width={36}
        height={36}
        borderRadius="pill"
        justifyContent="center"
        alignItems="center"
        bg={unlocked ? "$primary" : "$surfaceMuted"}
      >
        {unlocked ? (
          <FeatherIcon name="check" size={16} color="$onPrimary" />
        ) : (
          <FeatherIcon name="lock" size={14} color="$muted" />
        )}
      </Box>
      <Box flex={1} style={{ gap: 6 }}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="baseline">
          <Text variant="label" fontSize={14}>
            {milestone}일 연속
          </Text>
          <Text variant="caption" fontSize={12}>
            {unlocked ? "열림" : `${currentStreak}/${milestone}`}
          </Text>
        </Box>
        <Text variant="caption" fontSize={12} numberOfLines={1}>
          {getMilestoneRewardNames(milestone)}
        </Text>
        <Box height={5} borderRadius="pill" bg="$surfaceMuted" overflow="hidden">
          <Box height={5} borderRadius="pill" bg="$flame" style={{ width: `${progress * 100}%` }} />
        </Box>
      </Box>
    </Box>
  );
};

const StreakSheet = forwardRef<PickerSheetHandle>(function StreakSheet(_props, ref) {
  const record = useStreakStore(
    useShallow((s) => ({
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      lastStreakDate: s.lastStreakDate,
      freezeUsedWeek: s.freezeUsedWeek,
      ignitedDates: s.ignitedDates,
    }))
  );
  const { currentStreak, longestStreak, lastStreakDate, ignitedDates } = record;
  const today = toDateString();
  const ignitedToday = lastStreakDate === today;
  const stage = getCampfireStage(currentStreak);
  const nextStage = CAMPFIRE_STAGES.find((s) => s.minDays > currentStreak);

  const caption = ignitedToday
    ? "오늘도 불씨를 지폈어요. 내일도 장작을 더해 주세요"
    : currentStreak > 0
      ? "오늘의 불씨를 지피면 불이 더 커져요"
      : longestStreak > 0
        ? `최장 ${longestStreak}일까지 키워 본 불이에요. 오늘 다시 한 개비부터 시작해요`
        : "불씨를 지펴 다시 모닥불을 피워 보세요";

  return (
    <PickerSheet ref={ref} title="나의 모닥불" description="불씨를 지핀 날이 이어질수록 모닥불이 커져요">
      <Campfire streak={currentStreak} dimmed={!ignitedToday && currentStreak > 0} />

      <Box alignItems="center" mt="lg" style={{ gap: 4 }}>
        <Box flexDirection="row" alignItems="baseline" style={{ gap: 4 }}>
          <Text variant="display">
            {currentStreak}
          </Text>
          <Text fontSize={16} fontWeight="700">
            일째
          </Text>
          <Text variant="caption" fontSize={14} ml="xs">
            · {stage.name}
          </Text>
        </Box>
        <Text variant="caption" textAlign="center">
          {caption}
        </Text>
      </Box>

      <RecentDays days={getRecentDays(record, ignitedDates ?? [], today)} />

      <Box flexDirection="row" mt="lg" style={{ gap: 8 }}>
        <StatCell label="최장 기록" value={`${longestStreak}일`} />
        <StatCell
          label="불씨 지키기 (주 1회)"
          value={isFreezeAvailable(record, today) ? "🛡️ 남음" : "사용함"}
        />
        <StatCell
          label={nextStage ? `${nextStage.name}까지` : "최고 단계"}
          value={nextStage ? `${nextStage.minDays - currentStreak}일` : "🔥"}
        />
      </Box>

      <Text variant="stat" fontWeight="700" style={{ marginTop: 24, marginBottom: 12 }}>
        보상
      </Text>
      <Box style={{ gap: 14 }}>
        {STREAK_MILESTONES.map((m) => (
          <MilestoneRow key={m} milestone={m} currentStreak={currentStreak} unlocked={longestStreak >= m} />
        ))}
      </Box>
    </PickerSheet>
  );
});

export default StreakSheet;

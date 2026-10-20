// ─────────────────────────────────────────────────────────────
// streak-sheet.tsx — 나의 모닥불
// 스트릭 배지를 누르면 열리는 바텀시트.
//   - 연속 점화 일수만큼 자란 모닥불 (components/campfire.tsx)
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
  isFreezeAvailable,
  STREAK_MILESTONES,
} from "@/utils/streak";
import { forwardRef } from "react";
import Campfire from "./campfire";
import FeatherIcon from "./icon";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";

// 작은 통계 칸 (최장 기록 / 불씨 지키기 / 다음 단계)
const StatCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box flex={1} bg="$surfaceMuted" borderRadius="md" py="md" px="s" alignItems="center" style={{ gap: 4 }}>
    <Text fontSize={15} fontWeight="800" textAlign="center">
      {value}
    </Text>
    <Text variant="caption" fontSize={12} textAlign="center">
      {label}
    </Text>
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
          <Text fontSize={14} fontWeight="700">
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
  const record = useStreakStore();
  const { currentStreak, longestStreak, lastStreakDate } = record;
  const today = toDateString();
  const ignitedToday = lastStreakDate === today;
  const stage = getCampfireStage(currentStreak);
  const nextStage = CAMPFIRE_STAGES.find((s) => s.minDays > currentStreak);

  const caption = ignitedToday
    ? "오늘도 불씨를 지폈어요. 내일도 장작을 더해 주세요"
    : currentStreak > 0
      ? "오늘의 불씨를 지피면 불이 더 커져요"
      : "불씨를 지펴 다시 모닥불을 피워 보세요";

  return (
    <PickerSheet ref={ref} title="나의 모닥불" description="불씨를 지핀 날이 이어질수록 모닥불이 커져요">
      <Campfire streak={currentStreak} dimmed={!ignitedToday && currentStreak > 0} />

      <Box alignItems="center" mt="lg" style={{ gap: 4 }}>
        <Box flexDirection="row" alignItems="baseline" style={{ gap: 4 }}>
          <Text fontSize={34} fontWeight="900">
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

      <Text fontSize={15} fontWeight="700" style={{ marginTop: 24, marginBottom: 12 }}>
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

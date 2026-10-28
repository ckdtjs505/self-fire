// ─────────────────────────────────────────────────────────────
// streak-sheet.tsx — 나의 모닥불
// 스트릭 배지를 누르면 열리는 바텀시트.
//   - 연속 점화 일수만큼 자란 모닥불 (components/campfire.tsx)
//   - 최근 7일 동안 불씨를 지핀 날
//   - 최장 기록 · 불씨 지키기 · 다음 단계까지 남은 일수
//   - 불씨 지키기가 무엇인지, 이번 주에 남았는지 안내 문구
//   - 최근에 문장대로 해낸 일들 (완료한 날만, 전체는 해낸 일 화면 app/history.tsx)
//   - 3/7/14/30/50/100일 마일스톤 보상과 진행도
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { getMilestoneRewardNames } from "@/data/streak-rewards";
import { useDeedStore } from "@/store/deed";
import { useStreakStore } from "@/store/streak";
import { toDateString } from "@/utils/date";
import { Deed, isDeedDone, recentDeeds } from "@/utils/deed";
import {
  CAMPFIRE_STAGES,
  getCampfireStage,
  getRecentDays,
  isFreezeAvailable,
  RecentDay,
  STREAK_MILESTONES,
} from "@/utils/streak";
import { useRouter } from "expo-router";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable } from "react-native";
import Campfire from "./campfire";
import FeatherIcon, { Ionicon } from "./icon";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import { useShallow } from "zustand/react/shallow";

// 작은 통계 칸 (최장 기록 / 불씨 지키기 / 다음 단계)
const StatCell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box flex={1} bg="$surfaceMuted" borderRadius="md" py="md" px="s" alignItems="center" gap="xs">
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

// 모닥불 시트에 보여 줄 최근 해낸 일 수
const RECENT_DEED_COUNT = 5;

const dateLabel = (date: string, today: string) => {
  if (date === today) return "오늘";
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d} ${weekdayOf(date)}`;
};

// 문장대로 해낸 일: 날짜 · 해낸 일 · 따른 문장
const DeedRow: React.FC<{ deed: Deed; today: string }> = ({ deed, today }) => (
  <Box flexDirection="row" gap="md" accessible accessibilityLabel={`${dateLabel(deed.date, today)}, ${deed.text}, ${deed.quote.text}`}>
    <Box width={44} pt="xs">
      <Text variant="micro" color={deed.date === today ? "$primary" : "$muted"}>
        {dateLabel(deed.date, today)}
      </Text>
    </Box>
    <Box flex={1} gap="xs">
      <Text fontSize={15} fontWeight="700">
        {deed.text}
      </Text>
      <Text variant="caption" fontSize={12} numberOfLines={1}>
        {`“${deed.quote.text}”`}
      </Text>
    </Box>
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
    <Box flexDirection="row" alignItems="center" gap="md">
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
          {getMilestoneRewardNames(milestone) || "중간 목표"}
        </Text>
        <Box height={5} borderRadius="pill" bg="$surfaceMuted" overflow="hidden">
          <Box height={5} borderRadius="pill" bg="$flame" style={{ width: `${progress * 100}%` }} />
        </Box>
      </Box>
    </Box>
  );
};

const StreakSheet = forwardRef<PickerSheetHandle>(function StreakSheet(_props, ref) {
  const router = useRouter();
  // '해낸 일 전체 보기'에서 시트를 닫고 기록 화면으로 가려고 시트를 직접 잡는다.
  const sheetRef = useRef<PickerSheetHandle>(null);
  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));
  const openHistory = () => {
    sheetRef.current?.close();
    router.push("/history");
  };

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
  // 해낸(완료한) 날만 보여 준다. 정하기만 하고 해내지 못한 날은 불씨가 켜지지 않은 날이다.
  const deeds = useDeedStore((s) => s.deeds).filter(isDeedDone);
  const today = toDateString();
  const ignitedToday = lastStreakDate === today;
  const stage = getCampfireStage(currentStreak);
  const nextStage = CAMPFIRE_STAGES.find((s) => s.minDays > currentStreak);
  const freezeAvailable = isFreezeAvailable(record, today);
  const freezeGuide = freezeAvailable
    ? "🛡️ 하루를 빠뜨려도 한 주(월~일)에 한 번은 불씨를 지켜 줘요. 빠진 날은 연속 일수에 세지 않아요"
    : "🛡️ 이번 주 불씨 지키기는 썼어요. 다음 주 월요일에 다시 채워져요";

  const caption = ignitedToday
    ? "오늘도 불씨를 지폈어요. 내일도 장작을 더해 주세요"
    : currentStreak > 0
      ? "오늘 할 일을 해내고 완료를 누르면 불이 더 커져요"
      : longestStreak > 0
        ? `최장 ${longestStreak}일까지 키워 본 불이에요. 오늘 다시 한 개비부터 시작해요`
        : "문장대로 할 일 한 가지를 해내고 모닥불을 피워 보세요";

  return (
    <PickerSheet ref={sheetRef} title="나의 모닥불" description="불씨를 지핀 날이 이어질수록 모닥불이 커져요">
      <Campfire streak={currentStreak} dimmed={!ignitedToday && currentStreak > 0} />

      <Box alignItems="center" mt="lg" gap="xs">
        <Box flexDirection="row" alignItems="baseline" gap="xs">
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

      <Box flexDirection="row" mt="lg" gap="s">
        <StatCell label="최장 기록" value={`${longestStreak}일`} />
        <StatCell
          label="불씨 지키기 (주 1회)"
          value={freezeAvailable ? "🛡️ 남음" : "사용함"}
        />
        <StatCell
          label={nextStage ? `${nextStage.name}까지` : "최고 단계"}
          value={nextStage ? `${nextStage.minDays - currentStreak}일` : "🔥"}
        />
      </Box>
      <Text variant="caption" fontSize={12} mt="s">
        {freezeGuide}
      </Text>

      {deeds.length > 0 && (
        <>
          <Text variant="stat" fontWeight="700" style={{ marginTop: 24, marginBottom: 12 }}>
            문장대로 산 날
          </Text>
          <Box style={{ gap: 14 }}>
            {recentDeeds(deeds, RECENT_DEED_COUNT).map((deed) => (
              <DeedRow key={deed.date} deed={deed} today={today} />
            ))}
          </Box>
          {/* 지금까지 해낸 일 전부 (app/history.tsx) */}
          <Pressable
            onPress={openHistory}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Box flexDirection="row" alignItems="center" justifyContent="center" py="md" mt="s" gap="xs">
              <Text fontSize={14} fontWeight="700">
                {`해낸 일 전체 보기 (${deeds.length})`}
              </Text>
              <FeatherIcon name="chevron-right" size={16} color="$flame" />
            </Box>
          </Pressable>
        </>
      )}

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

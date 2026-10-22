// ─────────────────────────────────────────────────────────────
// app/history.tsx
// 해낸 일 기록. 지금까지 문장대로 해낸 일을 모두, 달별로 최근부터 보여 준다. (/history)
//   - 한 칸: 날짜 · 해낸 일 (크게) · 그날 따른 문장
//   - 누르면 홈에서 그 문장을 연다. (알림·사이드바와 같은 길, hooks/useQuotePager.ts)
//   - 정하기만 하고 해내지 못한 날은 불씨가 켜지지 않은 날이라 넣지 않는다.
// 사이드바의 '따라 산 날들'과 나의 모닥불 시트의 '전체 보기'에서 연다.
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import { Ionicon } from "@/components/icon";
import ScreenHeader from "@/components/screen-header";
import { useDeedStore } from "@/store/deed";
import { usePendingQuoteStore } from "@/store/notification";
import { Deed, groupDoneDeedsByMonth } from "@/utils/deed";
import { tapHaptic } from "@/utils/haptics";
import { useRouter } from "expo-router";
import { Pressable, SectionList } from "react-native";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// "21일 화요일"
const dayLabel = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return `${day}일 ${WEEKDAYS[new Date(year, month - 1, day).getDay()]}요일`;
};

// 아직 해낸 일이 없을 때
const EmptyState = () => (
  <Box flex={1} justifyContent="center" alignItems="center" padding="xl" style={{ marginTop: 96 }}>
    <Box width={76} height={76} borderRadius="pill" bg="$surfaceMuted" justifyContent="center" alignItems="center">
      <Ionicon name="flame-outline" size={32} color="$flame" />
    </Box>
    <Text variant="heading" marginTop="xl">
      아직 해낸 일이 없어요
    </Text>
    <Text variant="caption" fontSize={14} marginTop="s" textAlign="center" lineHeight={21}>
      오늘 따를 문장대로 할 일 한 가지를 정하고{"\n"}해낸 뒤 완료를 누르면 여기에 쌓여요.
    </Text>
  </Box>
);

// 해낸 일 한 칸
const DeedRow: React.FC<{ deed: Deed; onPress: () => void }> = ({ deed, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${dayLabel(deed.date)}, ${deed.text}, ${deed.quote.text}`}
    accessibilityHint="눌러서 이 문장을 홈에서 엽니다"
    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
  >
    <Box
      bg="$surface"
      borderWidth={1}
      borderColor="$border"
      marginHorizontal="lg"
      marginBottom="s"
      borderRadius="lg"
      padding="lg"
      style={{ gap: 8 }}
    >
      <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
        <Ionicon name="checkmark-circle" size={15} color="$flame" />
        <Text variant="caption" fontSize={13} fontWeight="700">
          {dayLabel(deed.date)}
        </Text>
      </Box>
      <Text fontSize={17} lineHeight={25} fontWeight="800">
        {deed.text}
      </Text>
      <Text variant="caption" fontSize={13} lineHeight={20}>
        {`“${deed.quote.text}”${deed.quote.author ? ` — ${deed.quote.author}` : ""}`}
      </Text>
    </Box>
  </Pressable>
);

export default function HistoryScreen() {
  const router = useRouter();
  const deeds = useDeedStore((s) => s.deeds);
  const months = groupDoneDeedsByMonth(deeds);
  const doneCount = months.reduce((sum, m) => sum + m.data.length, 0);

  // 홈으로 돌아가 이 문장을 맨 앞에 두고 보여 준다.
  const openOnHome = (deed: Deed) => {
    tapHaptic();
    usePendingQuoteStore.getState().setQuote({ ...deed.quote });
    router.dismissTo("/");
  };

  return (
    <SafeAreaView flex={1} bg="$background">
      <ScreenHeader title="해낸 일" />

      {doneCount > 0 && (
        <Text variant="caption" fontSize={12} marginHorizontal="xl" marginBottom="s" style={{ fontVariant: ["tabular-nums"] }}>
          {`문장대로 해낸 날 · ${doneCount}일`}
        </Text>
      )}

      <SectionList
        sections={months}
        keyExtractor={(item) => item.date}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
        renderSectionHeader={({ section }) => (
          <Text variant="overline" marginHorizontal="xl" marginTop="lg" marginBottom="s" accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <DeedRow deed={item} onPress={() => openOnHome(item)} />}
      />
    </SafeAreaView>
  );
}

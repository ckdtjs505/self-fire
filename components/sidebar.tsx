// ─────────────────────────────────────────────────────────────
// sidebar.tsx — 홈 화면 왼쪽 서랍
//   - 메뉴: 저장한 문장 · 나만의 명언 · 설정
//   - 오늘 따르는 문장: 오늘 고른 문장과 오늘의 한 줄 (누르면 홈에서 그 문장을 연다)
//   - 따라 산 날들: 지난날 따른 문장과 그날의 한 줄 몇 개 (전체는 나의 모닥불 시트에서)
// 저장한 문장은 다시 보려고 모아 두는 책갈피라 메뉴로만 두고,
// 서랍에는 이 앱의 핵심인 '문장대로 산 기록'을 보여 준다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { useDeedStore, useTodayDeed, useTodayQuote } from "@/store/deed";
import { usePendingQuoteStore } from "@/store/notification";
import { toDateString } from "@/utils/date";
import { Deed, recentDeeds } from "@/utils/deed";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, useRouter } from "expo-router";
import { Image, ScrollView } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FeatherIcon, { IconNames, Ionicon } from "./icon";

// 섹션 제목 (메뉴, 오늘 따르는 문장, 따라 산 날들)
const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Box marginBottom="s" marginLeft="xs">
    <Text variant="overline">{children}</Text>
  </Box>
);

type MenuItemProps = {
  icon: IconNames;
  title: string;
  onPress: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
    <Box flexDirection="row" alignItems="center" paddingVertical="s" paddingHorizontal="md" gap="md">
      <Box width={34} height={34} borderRadius="sm" bg="$surfaceMuted" justifyContent="center" alignItems="center">
        <FeatherIcon name={icon} size={17} />
      </Box>
      <Text variant="body" style={{ flex: 1 }}>
        {title}
      </Text>
      <FeatherIcon name="chevron-right" size={18} color="$muted" />
    </Box>
  </Pressable>
);

// 서랍에서 보여 줄 지난 한 줄 수 (전체는 나의 모닥불 시트에서)
const RECENT_PAST_DEEDS = 3;

// "10/21"
const shortDate = (date: string) => {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
};

// 오늘 따르는 문장 카드. 한 줄을 남겼으면 그 한 줄도 함께 보여 준다.
const TodayQuoteCard: React.FC<{ quote: Pick<Quote, "text" | "author">; deed: Deed | null; onPress: () => void }> = ({
  quote,
  deed,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`오늘 따르는 문장: ${quote.text}`}
    accessibilityHint="홈에서 이 문장을 엽니다"
    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
  >
    <Box bg="$surface" borderWidth={1} borderColor="$border" borderRadius="md" padding="lg">
      <Box>
        <Text fontSize={14} lineHeight={22} fontWeight="600" numberOfLines={4}>
          {quote.text}
        </Text>
        {!!quote.author && (
          <Text variant="caption" fontSize={12} marginTop="xs">
            {quote.author}
          </Text>
        )}
        <Box flexDirection="row" alignItems="center" marginTop="md" style={{ gap: 6 }}>
          <Ionicon name={deed ? "flame" : "flame-outline"} size={14} color={deed ? "$flame" : "$muted"} />
          <Text fontSize={13} fontWeight={deed ? "700" : "400"} color={deed ? "$foreground" : "$muted"} numberOfLines={2} style={{ flex: 1 }}>
            {deed ? deed.text : "아직 오늘의 한 줄을 남기지 않았어요"}
          </Text>
        </Box>
      </Box>
    </Box>
  </Pressable>
);

// 지난날 따른 문장 한 줄: 날짜 · 그날의 한 줄 · 따른 문장. 누르면 홈에서 그 문장을 연다.
const PastDeedRow: React.FC<{ deed: Deed; onPress: () => void }> = ({ deed, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${shortDate(deed.date)}, ${deed.text}, ${deed.quote.text}`}
    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
  >
    <Box flexDirection="row" paddingVertical="s" paddingHorizontal="md" gap="md">
      <Box width={40} pt="xs">
        <Text variant="micro" color="$muted">
          {shortDate(deed.date)}
        </Text>
      </Box>
      <Box flex={1} gap="xs">
        <Text fontSize={14} fontWeight="700" numberOfLines={2}>
          {deed.text}
        </Text>
        <Text variant="caption" fontSize={12} numberOfLines={1}>
          {`“${deed.quote.text}”`}
        </Text>
      </Box>
    </Box>
  </Pressable>
);

const Sidebar = ({ navigation }: DrawerContentComponentProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const todayQuote = useTodayQuote();
  const todayDeed = useTodayDeed();
  const deeds = useDeedStore((s) => s.deeds);
  const today = toDateString();
  const pastDeeds = recentDeeds(
    deeds.filter((d) => d.date !== today),
    RECENT_PAST_DEEDS
  );

  const navigateTo = (href: Href) => {
    navigation.closeDrawer();
    router.push(href);
  };

  // 홈에서 이 문장을 맨 앞에 두고 보여 준다. (알림을 눌렀을 때와 같은 길, hooks/useQuotePager.ts)
  const openQuote = (quote: Quote) => {
    navigation.closeDrawer();
    usePendingQuoteStore.getState().setQuote({ id: quote.id, text: quote.text, author: quote.author });
  };

  // 홈의 나의 모닥불 시트를 연다. (at: 같은 요청을 다시 보내도 반영되도록)
  const openCampfire = () => {
    navigation.closeDrawer();
    navigation.navigate("index", { view: "campfire", at: String(Date.now()) });
  };

  return (
    <Box flex={1} backgroundColor="$background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* ── 앱 로고 / 이름 ── */}
      <Box flexDirection="row" alignItems="center" paddingHorizontal="xl" paddingTop="xl" paddingBottom="xl" style={{ gap: 14 }}>
        <Image source={require("@/assets/images/fire-icon.png")} style={{ width: 52, height: 52, borderRadius: 16 }} />
        <Box>
          <Text fontSize={19} fontWeight="900" style={{ letterSpacing: 1.5 }}>
            SELF FIRE
          </Text>
          <Text variant="caption" marginTop="xs">
            나를 타오르게 하는 문장들
          </Text>
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {/* ── 메뉴 ── */}
        <Box marginBottom="xl">
          <SectionTitle>메뉴</SectionTitle>
          <Box bg="$surface" borderWidth={1} borderColor="$border" borderRadius="md" paddingVertical="xs">
            <MenuItem icon="bookmark" title="저장한 문장" onPress={() => navigateTo("/favorites")} />
            <MenuItem icon="edit-3" title="나만의 명언" onPress={() => navigateTo("/my-quotes")} />
            <MenuItem icon="settings" title="설정" onPress={() => navigateTo("/settings")} />
          </Box>
        </Box>

        {/* ── 오늘 따르는 문장 ── */}
        <Box marginBottom="xl">
          <SectionTitle>오늘 따르는 문장</SectionTitle>
          {todayQuote ? (
            <TodayQuoteCard quote={todayQuote} deed={todayDeed} onPress={() => openQuote(todayQuote)} />
          ) : (
            <Pressable onPress={() => navigation.closeDrawer()} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
              <Box
                alignItems="center"
                padding="xl"
                borderRadius="md"
                borderColor="$border"
                style={{ borderStyle: "dashed", borderWidth: 1.5 }}
              >
                <Ionicon name="flame-outline" size={26} color="$muted" />
                <Text variant="caption" marginTop="s" textAlign="center" lineHeight={19}>
                  {"아직 오늘 따를 문장을 정하지 않았어요\n마음에 닿는 문장 아래 '오늘 이 문장대로 살기'를 눌러 보세요"}
                </Text>
              </Box>
            </Pressable>
          )}
        </Box>

        {/* ── 따라 산 날들 ── */}
        {pastDeeds.length > 0 && (
          <Box>
            <SectionTitle>따라 산 날들</SectionTitle>
            <Box bg="$surface" borderWidth={1} borderColor="$border" borderRadius="md" paddingVertical="xs">
              {pastDeeds.map((deed) => (
                <PastDeedRow key={deed.date} deed={deed} onPress={() => openQuote(deed.quote)} />
              ))}
            </Box>
            <Pressable onPress={openCampfire} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Box flexDirection="row" alignItems="center" justifyContent="center" py="md" gap="xs">
                <Text fontSize={14} fontWeight="700" color="$flame">
                  전체 보기 · 나의 모닥불
                </Text>
                <FeatherIcon name="chevron-right" size={16} color="$flame" />
              </Box>
            </Pressable>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
};

export default Sidebar;

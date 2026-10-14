import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, useRouter } from "expo-router";
import { Alert, Image, ScrollView } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FeatherIcon, { IconNames, Ionicon } from "./icon";

// 섹션 제목 (메뉴, 불씨 보관함)
const SectionTitle: React.FC<{ children: string; count?: number }> = ({ children, count }) => (
  <Box flexDirection="row" alignItems="center" marginBottom="s" marginLeft="xs" style={{ gap: 6 }}>
    <Text variant="overline">{children}</Text>
    {count !== undefined && count > 0 && (
      <Box bg="$primarySoft" borderRadius="pill" px="s" style={{ paddingVertical: 1 }}>
        <Text color="$primary" fontSize={11} fontWeight="800">
          {count}
        </Text>
      </Box>
    )}
  </Box>
);

type MenuItemProps = {
  icon: IconNames;
  title: string;
  onPress: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
    <Box flexDirection="row" alignItems="center" paddingVertical="s" paddingHorizontal="md" style={{ gap: 12 }}>
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

// 불씨 보관함에 저장된 명언 카드. 누르면 삭제 여부를 묻는다.
const FavoriteQuoteCard: React.FC<{ quote: Quote; onRemove: () => void }> = ({ quote, onRemove }) => (
  <Pressable
    onPress={() =>
      Alert.alert("삭제하시겠습니까?", "불씨 보관함에서 제거됩니다.", [
        { text: "삭제", style: "destructive", onPress: onRemove },
        { text: "취소", style: "cancel" },
      ])
    }
    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
  >
    <Box
      bg="$surface"
      borderWidth={1}
      borderColor="$border"
      borderRadius="md"
      padding="lg"
      marginBottom="s"
      flexDirection="row"
      style={{ gap: 12 }}
    >
      <Box width={3} borderRadius="pill" bg="$flame" style={{ opacity: 0.8 }} />
      <Box flex={1}>
        <Text fontSize={14} lineHeight={22} fontWeight="500">
          {quote.text}
        </Text>
        {!!quote.author && (
          <Text variant="caption" fontSize={12} marginTop="s">
            {quote.author}
          </Text>
        )}
      </Box>
    </Box>
  </Pressable>
);

const Sidebar = ({ navigation }: DrawerContentComponentProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const favorites = useFavoriteQuoteStore((state) => state.favorites);
  const favoritesData = useFavoriteQuoteStore((state) => state.favoritesData) || [];
  const customQuotes = useFavoriteQuoteStore((state) => state.customQuotes);
  const removeFavorite = useFavoriteQuoteStore((state) => state.removeFavorite);

  // 즐겨찾기 ID 순서대로 명언 내용을 찾는다. (저장된 데이터 → 나만의 명언 순)
  const favoriteQuotes = favorites
    .map((id) => favoritesData.find((q) => q.id === id) || customQuotes.find((q) => q.id === id))
    .filter((quote): quote is Quote => !!quote);

  const navigateTo = (href: Href) => {
    navigation.closeDrawer();
    router.push(href);
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
            <MenuItem icon="edit-3" title="나만의 명언" onPress={() => navigateTo("/MyQuotesScreen")} />
            <MenuItem icon="settings" title="설정" onPress={() => navigateTo("/SettingScreen")} />
          </Box>
        </Box>

        {/* ── 불씨 보관함 ── */}
        <SectionTitle count={favoriteQuotes.length}>불씨 보관함</SectionTitle>

        {favoriteQuotes.length === 0 ? (
          <Box
            alignItems="center"
            padding="xl"
            borderRadius="md"
            borderColor="$border"
            style={{ borderStyle: "dashed", borderWidth: 1.5 }}
          >
            <Ionicon name="flame-outline" size={26} color="$muted" />
            <Text variant="caption" marginTop="s" textAlign="center" lineHeight={19}>
              마음에 닿은 문장에{"\n"}불씨를 지펴 보관해 보세요
            </Text>
          </Box>
        ) : (
          favoriteQuotes.map((quote) => (
            <FavoriteQuoteCard key={quote.id} quote={quote} onRemove={() => removeFavorite(quote.id)} />
          ))
        )}
      </ScrollView>
    </Box>
  );
};

export default Sidebar;

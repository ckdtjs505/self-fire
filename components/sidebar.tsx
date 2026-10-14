import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, useRouter } from "expo-router";
import { Alert, Image, ScrollView } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FeatherIcon, { IconNames, Ionicon } from "./icon";

// 섹션 제목 (MENU, SPARK ARCHIVE)
const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text fontSize={12} fontWeight="bold" color="$sidebarForeground" opacity={0.4} marginBottom="s" marginLeft="s">
    {children}
  </Text>
);

type MenuItemProps = {
  icon: IconNames;
  title: string;
  onPress: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      backgroundColor: pressed ? "rgba(255,255,255,0.1)" : undefined,
    })}
  >
    <FeatherIcon name={icon} size={20} color="$sidebarForeground" />
    <Text marginLeft="md" color="$sidebarForeground" fontSize={16} fontWeight="600">
      {title}
    </Text>
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
  >
    <Box
      borderWidth={1}
      borderColor="$sidebarForeground"
      borderRadius="sm"
      padding="lg"
      marginBottom="md"
      backgroundColor="$sidebarBackground"
      style={{ opacity: 0.9 }}
    >
      <Text fontSize={14} lineHeight={22} color="$sidebarForeground" fontWeight="500">
        {`"${quote.text}"`}
      </Text>
      {!!quote.author && (
        <Text fontSize={12} color="$sidebarForeground" opacity={0.6} marginTop="xs" textAlign="right">
          - {quote.author}
        </Text>
      )}
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
    <Box flex={1} backgroundColor="$sidebarBackground" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* ── 앱 로고 / 이름 ── */}
      <Box alignItems="center" paddingTop="xl" paddingBottom="lg">
        <Image
          source={require("@/assets/images/fire-icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }}
        />
        <Text fontSize={20} fontWeight="bold" color="$sidebarForeground">
          SELF FIRE
        </Text>
        <Text fontSize={13} color="$sidebarForeground" opacity={0.6} marginTop="xs">
          나를 타오르게 하는 문장들
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* ── 메뉴 ── */}
        <Box marginBottom="xl">
          <SectionTitle>MENU</SectionTitle>
          <Box bg="$sidebarBackground" borderRadius="md" overflow="hidden" style={{ gap: 4 }}>
            <MenuItem icon="edit-3" title="나만의 명언" onPress={() => navigateTo("/MyQuotesScreen")} />
            <MenuItem icon="settings" title="설정" onPress={() => navigateTo("/SettingScreen")} />
          </Box>
        </Box>

        {/* ── 불씨 보관함 ── */}
        <Box marginBottom="s">
          <SectionTitle>SPARK ARCHIVE</SectionTitle>
        </Box>

        {favoriteQuotes.length === 0 ? (
          <Box
            alignItems="center"
            marginTop="md"
            padding="xl"
            style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 12 }}
          >
            <Ionicon name="flame" size={24} color="$sidebarForeground" style={{ opacity: 0.2 }} />
            <Text color="$sidebarForeground" opacity={0.5} marginTop="s" fontSize={13}>
              보관된 불씨가 없습니다.
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

import { Box, Text } from "@/atom";
import { quotes } from "@/data/quotes";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Alert, ScrollView, Image } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useStore } from "zustand";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FeatherIcon from "./icon";

import { DrawerContentComponentProps } from "@react-navigation/drawer";

type Props = DrawerContentComponentProps;
const Sidebar: React.FC<Props> = ({ navigation }) => {
  const router = useRouter();
  const favorites = useStore(useFavoriteQuoteStore, (state) => state.favorites);
  const removeFavorites = useStore(
    useFavoriteQuoteStore,
    (state) => state.removeFavorite,
  );
  const insets = useSafeAreaInsets();

  const favoriteQuote = favorites.map((quoteId) =>
    quotes.find((quote) => quote.id === quoteId),
  );

  return (
    <Box
      flex={1}
      backgroundColor={"$sidebarBackground"}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Box alignItems={"center"} paddingTop={"xl"} paddingBottom={"lg"}>
        <Image
          source={require("@/assets/images/fire-icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }}
        />
        <Text fontSize={20} fontWeight={"bold"} color={"$sidebarForeground"}>
          SELF FIRE
        </Text>
        <Text fontSize={13} color={"$sidebarForeground"} opacity={0.6} marginTop={"xs"}>
          나를 타오르게 하는 문장들
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* 메뉴 섹션 */}
        <Box marginBottom="xl">
          <Text fontSize={12} fontWeight="bold" color="$sidebarForeground" opacity={0.4} marginBottom="s" marginLeft="s">
            MENU
          </Text>
          <Box bg="$sidebarBackground" borderRadius="md" overflow="hidden">
            <Pressable
              onPress={() => {
                navigation.closeDrawer();
                router.push("/MyQuotesScreen");
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : undefined,
                borderRadius: 8
              })}
            >
              <FeatherIcon name="edit-3" size={20} color="$sidebarForeground" />
              <Text marginLeft="md" color="$sidebarForeground" fontSize={16} fontWeight="600">나만의 명언</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                navigation.closeDrawer();
                router.push("/SettingScreen");
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : undefined,
                borderRadius: 8,
                marginTop: 4
              })}
            >
              <FeatherIcon name="settings" size={20} color="$sidebarForeground" />
              <Text marginLeft="md" color="$sidebarForeground" fontSize={16} fontWeight="600">설정</Text>
            </Pressable>
          </Box>
        </Box>

        {/* 즐겨찾기 섹션 */}
        <Box marginBottom="s">
          <Text fontSize={12} fontWeight="bold" color="$sidebarForeground" opacity={0.4} marginBottom="s" marginLeft="s">
            FAVORITES
          </Text>
        </Box>

        {favoriteQuote.length === 0 ? (
          <Box alignItems="center" marginTop="md" padding="xl" style={{ borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12 }}>
            <FeatherIcon name="heart" size={24} color="$sidebarForeground" style={{ opacity: 0.2 }} />
            <Text color={"$sidebarForeground"} opacity={0.5} marginTop="s" fontSize={13}>
              저장된 명언이 없습니다.
            </Text>
          </Box>
        ) : null}

        {favoriteQuote.map((quote, idx) => {
          if (!quote) return null;
          const { text, id, author } = quote;

          return (
            <Pressable
              key={idx}
              onPress={() => {
                Alert.alert("삭제하시겠습니까?", "즐겨찾기에서 제거됩니다.", [
                  {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => {
                      removeFavorites(id);
                    },
                  },
                  { text: "취소", style: "cancel" },
                ]);
              }}
            >
              <Box
                borderWidth={1}
                borderColor={"$sidebarForeground"}
                borderRadius={"sm"}
                padding={"lg"}
                marginBottom={"md"}
                backgroundColor={"$sidebarBackground"}
                style={{ opacity: 0.9 }}
              >
                <Text
                  fontSize={14}
                  lineHeight={22}
                  color={"$sidebarForeground"}
                  fontWeight="500"
                >
                  "{text}"
                </Text>
                {author && (
                  <Text
                    fontSize={12}
                    color={"$sidebarForeground"}
                    opacity={0.6}
                    marginTop="xs"
                    textAlign="right"
                  >
                    - {author}
                  </Text>
                )}
              </Box>
            </Pressable>
          );
        })}
      </ScrollView>
    </Box>
  );
};

export default Sidebar;

import { Box, Text } from "@/atom";
import { quotes } from "@/data/quotes";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Alert, ScrollView, Image } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useStore } from "zustand";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {};
const Sidebar: React.FC<Props> = () => {
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
        {favoriteQuote.length === 0 ? (
          <Box alignItems="center" marginTop="xl">
            <Text color={"$sidebarForeground"} opacity={0.5}>
              아직 저장된 명언이 없습니다.
            </Text>
          </Box>
        ) : null}

        {favoriteQuote.map((quote, idx) => {
          if (!quote) return null;
          const { text, id } = quote;
          
          return (
            <Pressable
              key={idx}
              onPress={() => {
                Alert.alert("삭제하시겠습니까?", "다시 되돌릴 수 없습니다.", [
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
              >
                <Text
                  fontSize={15}
                  lineHeight={24}
                  color={"$sidebarForeground"}
                >
                  "{text}"
                </Text>
              </Box>
            </Pressable>
          );
        })}
      </ScrollView>
    </Box>
  );
};

export default Sidebar;

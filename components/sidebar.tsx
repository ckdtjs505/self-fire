import { Box, Text } from "@/atom";
import { quotes } from "@/data/quotes";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Alert } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useStore } from "zustand";
type Props = {};
const Sidebar: React.FC<Props> = () => {
  const favorites = useStore(useFavoriteQuoteStore, (state) => state.favorites);
  const removeFavorites = useStore(
    useFavoriteQuoteStore,
    (state) => state.removeFavorite,
  );
  const favoriteQuote = favorites.map((quoteId) =>
    quotes.find((quote) => quote.id === quoteId),
  );

  return (
    <Box
      flex={1}
      backgroundColor={"$sidebarBackground"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Box>
        <Text fontSize={24} color={"$sidebarForeground"}>
          SELF FIRE
        </Text>
        <Text fontSize={18} color={"$sidebarForeground"}>
          나를 타오르게 하는 문장들
        </Text>
      </Box>

      <Box margin={"md"}>
        {favoriteQuote.map(({ text, id }, idx) => {
          return (
            <Pressable
              key={idx}
              onPress={() => {
                Alert.alert("삭제하시겠습니까?", "다시 되돌릴 수 없습니다,", [
                  {
                    text: "삭제",
                    onPress: () => {
                      removeFavorites(id);
                    },
                  },
                  { text: "취소" },
                ]);
              }}
            >
              <Text
                fontSize={16}
                marginTop={"s"}
                key={idx}
                color={"$sidebarForeground"}
              >
                {text}
              </Text>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
};

export default Sidebar;

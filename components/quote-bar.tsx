import { Box } from "@/atom";
import FeatherIcon from "./icon";
import ShareButton from "./share-button";
import { Alert, Pressable } from "react-native";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Quote } from "@/models";
type Props = {
  text: string;
  author: string;
  id: string;
};

const Quotebar: React.FC<Quote> = (quote) => {
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore();
  return (
    <Box
      m="md"
      p="xs"
      height={44}
      width={100}
      justifyContent={"space-around"}
      borderRadius={"lg"}
      alignItems={"center"}
      backgroundColor={"$headerBackground"}
      flexDirection={"row"}
    >
      <ShareButton text={`${quote.text} -${quote.author}`}></ShareButton>

      {!favorites.includes(quote.id) ? (
        <Pressable
          onPress={() => {
            addFavorite(quote.id);
            Alert.alert("저장되었습니다");
          }}
        >
          <FeatherIcon name="heart" size={24}></FeatherIcon>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            removeFavorite(quote.id);
            Alert.alert("삭제되었습니다");
          }}
        >
          <FeatherIcon color={"red"} name="heart" size={24}></FeatherIcon>
        </Pressable>
      )}
    </Box>
  );
};
export default Quotebar;

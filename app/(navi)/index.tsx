import { Box } from "@/atom";
import HeaderLeft from "@/components/header-left";
import HeaderRight from "@/components/header-right";
import QuoteItem from "@/components/quote-items";
import { quotes } from "@/data/quotes";
import { Dimensions, View } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";

const { width, height } = Dimensions.get("window");
export default function Index() {
  return (
    <Box
      bg="$background"
      flex={1}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <HeaderLeft></HeaderLeft>
      <HeaderRight></HeaderRight>
      <SwiperFlatList
        vertical={true}
        data={quotes}
        renderItem={({ item }) => {
          return (
            <Box
              flex={1}
              justifyContent={"center"}
              alignItems={"center"}
              width={width}
              height={height}
            >
              <QuoteItem text={item.text} author={item.author} />
            </Box>
          );
        }}
      />
    </Box>
  );
}

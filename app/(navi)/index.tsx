import { Box } from "@/atom";
import HeaderLeft from "@/components/header-left";
import QuoteItem from "@/components/quote-items";
import { quotes } from "@/data/quotes";
import { Dimensions, View } from "react-native";
import SwiperFlatList from "react-native-swiper-flatlist";

const { width, height } = Dimensions.get("window");
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <HeaderLeft></HeaderLeft>
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
    </View>
  );
}

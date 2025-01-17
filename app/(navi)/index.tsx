import { Box, SafeAreaView } from "@/atom";
import HeaderLeft from "@/components/header-left";
import HeaderRight from "@/components/header-right";
import QuoteItem from "@/components/quote-items";
import { quotes } from "@/data/quotes";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SwiperFlatList from "react-native-swiper-flatlist";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");

  return (
    <SafeAreaView flex={1}>
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
                height={height - insets.top - insets.bottom}
              >
                <QuoteItem text={item.text} author={item.author} />
              </Box>
            );
          }}
        />
      </Box>
    </SafeAreaView>
  );
}

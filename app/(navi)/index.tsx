import { Box, SafeAreaView } from "@/atom";
import HeaderLeft from "@/components/header-left";
import HeaderRight from "@/components/header-right";
import QuoteItem from "@/components/quote-items";
import { getQuote, quotes } from "@/data/quotes";
import { Dimensions } from "react-native";
import Swiper from "react-native-swiper";

export default function Index() {

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
        <Box flex={1} justifyContent={"center"} alignItems={"center"}>
          <Swiper
            horizontal={false}
            showsButtons={false}
            showsPagination={false}
            onIndexChanged={() => {
              console.log("index Change");
            }}
          >
            <QuoteItem text={getQuote().text} author={getQuote().author} />
            <QuoteItem text={getQuote().text} author={getQuote().author} />
          </Swiper>
        </Box>
      </Box>
    </SafeAreaView>
  );
}

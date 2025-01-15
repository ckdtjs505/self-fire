import HeaderLeft from "@/components/header-left";
import HeaderRight from "@/components/header-right";
import QuoteItem from "@/components/quote-items";
import { Text, View } from "react-native";

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
      <HeaderRight></HeaderRight>

      <QuoteItem></QuoteItem>
    </View>
  );
}

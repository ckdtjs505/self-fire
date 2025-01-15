import HeaderLeft from "@/components/header-left";
import Quotebar from "@/components/quote-bar";
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

      <QuoteItem></QuoteItem>
      <Quotebar></Quotebar>
    </View>
  );
}

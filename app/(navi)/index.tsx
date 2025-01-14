import HeaderLeft from "@/components/header-left";
import HeaderRight from "@/components/header-right";
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
      <Text>Hello changsun World!!</Text>
    </View>
  );
}

import Header from "@/components/header";
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
      <Header></Header>
      <Text>Hello changsun World!!</Text>
    </View>
  );
}

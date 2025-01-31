import { Box, SafeAreaView, Text } from "@/atom";
import { Theme } from "@/themes";
import { useTheme } from "@shopify/restyle";
import { StatusBar as StatusBarRN, StatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatusBar = () => {
  const theme = useTheme<Theme>();
  const { top } = useSafeAreaInsets();
  console.log(top);
  return (
    <Box bg={"$background"} height={top}>
      <SafeAreaView backgroundColor={"$background"}>
        <Text>test</Text>
        <StatusBarRN
          translucent={true}
          barStyle={theme.barStyle}
          backgroundColor={theme.colors["$background"]}
        ></StatusBarRN>
      </SafeAreaView>
    </Box>
  );
};
export default StatusBar;

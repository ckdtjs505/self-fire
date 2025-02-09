import { Box } from "@/atom";
import { Theme } from "@/themes";
import { useTheme } from "@shopify/restyle";
import { StatusBar as StatusBarRN } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatusBar = () => {
  const theme = useTheme<Theme>();
  const { top } = useSafeAreaInsets();
  return (
    <Box
      position={"absolute"}
      top={0}
      left={0}
      right={0}
      height={top}
      zIndex={1}
      backgroundColor={"$background"}
    >
      <StatusBarRN
        translucent={true}
        style={theme.barStyle}
        backgroundColor={theme.colors["$background"]}
      ></StatusBarRN>
    </Box>
  );
};

export default StatusBar;

import { Theme } from "@/themes";
import { useTheme } from "@shopify/restyle";
import { StatusBar as StatusBarRN, StatusBarStyle } from "react-native";
const StatusBar = () => {
  const theme = useTheme<Theme>();

  return (
    <StatusBarRN
      translucent={true}
      barStyle={theme.barStyle as StatusBarStyle}
      backgroundColor={theme.colors["$background"]}
    ></StatusBarRN>
  );
};
export default StatusBar;

import { Theme } from "@/themes";
import { useTheme } from "@shopify/restyle";
import { StatusBar as StatusBarRN } from "react-native";
const StatusBar = () => {
  const theme = useTheme<Theme>();

  return (
    <StatusBarRN backgroundColor={theme.colors["$background"]}></StatusBarRN>
  );
};
export default StatusBar;

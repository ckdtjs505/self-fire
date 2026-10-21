import { Box } from "@/atom";
import { useAppTheme } from "@/themes";
import { StatusBar as StatusBarRN, StatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 상태바 영역을 현재 테마 배경색으로 칠한다.
const StatusBar = () => {
  const theme = useAppTheme();
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
      {/* edge-to-edge에서는 backgroundColor/translucent가 지원 중단된 Window API를 호출하므로 넘기지 않는다. */}
      <StatusBarRN style={theme.barStyle as StatusBarStyle} />
    </Box>
  );
};

export default StatusBar;

import { Box } from "@/atom";
import { Theme } from "@/themes";
import { useTheme } from "@shopify/restyle";
import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
  children: React.ReactNode;
  // 활성 상태이면 activeColor 배경 + 같은 색 그림자로 강조한다.
  active?: boolean;
  activeColor?: keyof Theme["colors"];
};

/**
 * 화면 상단에 떠 있는 40x40 원형 아이콘 버튼.
 */
const HeaderIconButton: React.FC<Props> = ({
  onPress,
  children,
  active = false,
  activeColor = "$primary",
}) => {
  const theme = useTheme<Theme>();

  return (
    <Pressable onPress={onPress}>
      <Box
        borderRadius="hg"
        width={40}
        height={40}
        justifyContent="center"
        alignItems="center"
        backgroundColor={active ? activeColor : "$sidebarBackground"}
        style={{
          shadowColor: active ? theme.colors[activeColor] : "#000",
          shadowOpacity: active ? 0.3 : 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        {children}
      </Box>
    </Pressable>
  );
};

export default HeaderIconButton;

import { Box } from "@/atom";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  label: string;
  onPress: () => void;
  // 켜진 상태이면 불씨 색으로 채운다. (예: 불씨 보관함에 담긴 명언)
  active?: boolean;
  children: React.ReactNode;
};

/**
 * 명언 카드 아래 둥근 아이콘 액션 버튼. label은 화면에 보이지 않고 접근성 라벨로만 쓴다.
 * 부모 PanGestureHandler 안에서 쓰므로 react-native-gesture-handler의 Pressable을 사용한다. (quote-bar.tsx 참고)
 */
const ActionButton: React.FC<Props> = ({ label, onPress, active = false, children }) => (
  <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
    <Box
      width={52}
      height={52}
      borderRadius="pill"
      justifyContent="center"
      alignItems="center"
      bg={active ? "$flame" : "$surface"}
      borderWidth={active ? 0 : 1}
      borderColor="$border"
    >
      {children}
    </Box>
  </Pressable>
);

export default ActionButton;

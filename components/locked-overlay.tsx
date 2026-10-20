import { Box, Text } from "@/atom";
import { StyleSheet } from "react-native";
import FeatherIcon from "./icon";

type Props = {
  unlockAt: number;
  borderRadius: number;
  compact?: boolean; // 작은 타일(카드 배경)에서는 일수만 짧게
};

// 아직 해금되지 않은 보상 타일 위에 덮는 반투명 막 + 자물쇠 + 필요 일수
const LockedOverlay: React.FC<Props> = ({ unlockAt, borderRadius, compact }) => (
  <Box
    justifyContent="center"
    alignItems="center"
    style={[StyleSheet.absoluteFill, { borderRadius, backgroundColor: "rgba(0,0,0,0.72)", gap: 3 }]}
  >
    <FeatherIcon name="lock" size={compact ? 13 : 16} color="white" />
    <Text fontSize={compact ? 10 : 11} fontWeight="700" color="white">
      {compact ? `${unlockAt}일` : `${unlockAt}일 연속`}
    </Text>
  </Box>
);

export default LockedOverlay;

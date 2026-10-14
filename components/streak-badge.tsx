import React, { useEffect, useRef } from "react";
import { Box, Text } from "@/atom";
import { Ionicon } from "@/components/icon";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

type Props = {
  streak: number;
};

// 헤더 아이콘 버튼과 같은 높이의 알약 모양으로 연속 방문 일수를 보여준다.
const StreakBadge: React.FC<Props> = ({ streak }) => {
  const scale = useSharedValue(1);
  const prevStreak = useRef(streak);

  // 스트릭이 늘어났을 때만 살짝 튀어오른다. (화면에 처음 나타날 때는 가만히)
  useEffect(() => {
    if (streak > prevStreak.current && prevStreak.current > 0) {
      scale.value = withSequence(
        withSpring(1.12, { damping: 6 }),
        withSpring(1, { damping: 10 })
      );
    }
    prevStreak.current = streak;
  }, [streak, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (streak <= 0) return null;

  return (
    <Animated.View style={animStyle} accessibilityLabel={`${streak}일 연속 방문`}>
      <Box
        flexDirection="row"
        alignItems="center"
        bg="$surface"
        borderWidth={1}
        borderColor="$border"
        borderRadius="pill"
        height={42}
        style={{ gap: 5, paddingLeft: 12, paddingRight: 14 }}
      >
        <Ionicon name="flame" size={17} color="$flame" />
        <Text fontSize={15} fontWeight="800">
          {streak}
        </Text>
        <Text variant="caption" fontSize={12}>
          일째
        </Text>
      </Box>
    </Animated.View>
  );
};

export default StreakBadge;

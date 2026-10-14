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

// 헤더 아이콘 버튼과 같은 높이·배경의 알약 모양으로 연속 방문 일수를 보여준다.
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
    <Animated.View style={animStyle}>
      <Box
        flexDirection="row"
        alignItems="center"
        bg="$sidebarBackground"
        borderRadius="hg"
        height={40}
        justifyContent="center"
        style={{
          gap: 4,
          paddingLeft: 12,
          paddingRight: 14,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Ionicon name="flame" size={16} color="red" />
        <Text fontSize={14} fontWeight="bold">
          {streak}
        </Text>
        <Text fontSize={12} style={{ opacity: 0.6 }}>
          일째
        </Text>
      </Box>
    </Animated.View>
  );
};

export default StreakBadge;

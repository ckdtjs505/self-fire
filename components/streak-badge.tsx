import React, { useEffect, useRef } from "react";
import { Box, Text } from "@/atom";
import { Ionicon } from "@/components/icon";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

type Props = {
  streak: number;
  onPress: () => void;
};

// 헤더 아이콘 버튼과 같은 높이의 알약 모양으로 연속 점화 일수를 보여준다.
// 누르면 나의 모닥불(streak-sheet)을 연다. 불이 꺼졌으면(0일) 흐린 불꽃으로 보여 준다.
const StreakBadge: React.FC<Props> = ({ streak, onPress }) => {
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

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${streak}일 연속 점화`}
        accessibilityHint="나의 모닥불을 엽니다"
      >
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
          <Ionicon name={streak > 0 ? "flame" : "flame-outline"} size={17} color={streak > 0 ? "$flame" : "$muted"} />
          <Text variant="stat">
            {streak}
          </Text>
          <Text variant="caption" fontSize={12}>
            일째
          </Text>
        </Box>
      </Pressable>
    </Animated.View>
  );
};

export default StreakBadge;

import React, { useEffect, useRef } from "react";
import { Box, Text } from "@/atom";
import { Ionicon } from "@/components/icon";
import { useStreakStore } from "@/store/streak";
import { toDateString } from "@/utils/date";
import { isFreezeAvailable, nextMilestone } from "@/utils/streak";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

type Props = {
  streak: number;
};

// 누르면 보여 줄 안내: 불씨 지키기 남은 횟수 + 다음 보상까지 남은 일수
const streakInfoMessage = () => {
  const state = useStreakStore.getState();
  const freeze = isFreezeAvailable(state, toDateString())
    ? "🛡️ 이번 주 불씨 지키기 1회 남음"
    : "🛡️ 이번 주 불씨 지키기 사용함";
  const next = nextMilestone(state.currentStreak);
  const reward = next ? `다음 보상까지 ${next.daysLeft}일` : "모든 보상을 열었어요";
  return `${freeze} · ${reward}`;
};

// 헤더 아이콘 버튼과 같은 높이의 알약 모양으로 연속 점화 일수를 보여준다.
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
      <Pressable
        onPress={() => Toast.show({ type: "info", text2: streakInfoMessage() })}
        accessibilityRole="button"
        accessibilityLabel={`${streak}일 연속 점화`}
        accessibilityHint="불씨 지키기와 다음 보상을 알려 줍니다"
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
          <Ionicon name="flame" size={17} color="$flame" />
          <Text fontSize={15} fontWeight="800">
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

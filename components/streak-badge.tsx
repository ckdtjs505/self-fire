import React from "react";
import { Box, Text } from "@/atom";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { useEffect } from "react";

type Props = {
  streak: number;
};

const StreakBadge: React.FC<Props> = ({ streak }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (streak > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 4 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, [streak]);

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
        borderWidth={1}
        borderColor="$primary"
        height={32}
        minWidth={60}
        justifyContent="center"
        style={{ gap: 4, paddingHorizontal: 8 }}
      >
        <Text fontSize={16} style={{ lineHeight: 18 }}>🔥</Text>
        <Text fontSize={13} fontWeight="bold" color="$primary">
          {streak}일
        </Text>
      </Box>
    </Animated.View>
  );
};

export default StreakBadge;

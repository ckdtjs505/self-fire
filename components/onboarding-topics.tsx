// ─────────────────────────────────────────────────────────────
// onboarding-topics.tsx — 첫 실행 주제 고르기
// 처음 설치한 사용자에게 불씨 점화 화면보다 먼저 한 번 보여 준다.
// 고른 주제는 '전체'와 오늘의 명언(홈·알림·위젯)의 후보가 된다. 건너뛰면 모든 명언.
// 나중에 설정 > 관심 주제에서 바꿀 수 있다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { CategoryId } from "@/data/quote-categories";
import { useCategoryStore } from "@/store/category";
import { trackEvent } from "@/utils/analytics";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicon } from "./icon";
import TopicChips, { toggleTopic } from "./topic-chips";

const OnboardingTopics: React.FC = () => {
  const insets = useSafeAreaInsets();
  const setInterests = useCategoryStore((s) => s.setInterests);
  const [selected, setSelected] = useState<CategoryId[]>([]);

  const finish = (ids: CategoryId[]) => {
    trackEvent("interests_set", { source: "onboarding", count: ids.length, topics: ids.join(",") });
    setInterests(ids);
  };

  return (
    <Box
      bg="$background"
      style={[StyleSheet.absoluteFill, { zIndex: 300, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}
    >
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Ionicon name="flame" size={30} color="$flame" />
        <Text fontSize={26} fontWeight="900" style={{ marginTop: 14, lineHeight: 34 }}>
          어떤 불씨가 필요하세요?
        </Text>
        <Text variant="caption" fontSize={15} style={{ marginTop: 8, marginBottom: 24, lineHeight: 22 }}>
          고른 주제의 명언으로 하루를 시작해요.{"\n"}여러 개 골라도 좋고, 나중에 설정에서 바꿀 수 있어요.
        </Text>

        <TopicChips selected={selected} onToggle={(id) => setSelected((prev) => toggleTopic(prev, id))} />
      </ScrollView>

      <Box px="xl" style={{ gap: 14 }}>
        <Pressable
          onPress={() => finish(selected)}
          disabled={selected.length === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: selected.length === 0 }}
          style={({ pressed }) => ({ opacity: selected.length === 0 ? 0.4 : pressed ? 0.8 : 1 })}
        >
          <Box height={54} borderRadius="pill" bg="$primary" justifyContent="center" alignItems="center">
            <Text color="$onPrimary" fontSize={16} fontWeight="800">
              {selected.length === 0 ? "주제를 골라 주세요" : `${selected.length}개 주제로 시작하기`}
            </Text>
          </Box>
        </Pressable>
        <Pressable onPress={() => finish([])} hitSlop={8} accessibilityRole="button">
          <Text variant="caption" textAlign="center" fontSize={14}>
            건너뛰고 모든 명언 보기
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
};

export default OnboardingTopics;

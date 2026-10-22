// ─────────────────────────────────────────────────────────────
// deed-prompt.tsx — 명언 카드 아래 '오늘의 한 줄' 자리
//   - 오늘 아직 남기지 않았으면: 이 문장대로 한 일을 남기는 버튼
//   - 남겼으면: 오늘 남긴 한 줄 (누르면 고친다)
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { Deed } from "@/utils/deed";
import { tapHaptic } from "@/utils/haptics";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import FeatherIcon, { Ionicon } from "./icon";

type Props = {
  quote: Quote | null;
  todayDeed: Deed | null;
};

const DeedPrompt: React.FC<Props> = ({ quote, todayDeed }) => {
  const router = useRouter();

  const open = () => {
    tapHaptic();
    router.push(
      todayDeed || !quote
        ? "/deed"
        : { pathname: "/deed", params: { quoteId: quote.id, text: quote.text, author: quote.author } }
    );
  };

  if (todayDeed) {
    return (
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`오늘의 한 줄: ${todayDeed.text}`}
        accessibilityHint="눌러서 고칠 수 있어요"
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, width: "100%" })}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          bg="$surface"
          borderWidth={1}
          borderColor="$border"
          borderRadius="lg"
          px="lg"
          py="md"
          gap="md"
        >
          <Ionicon name="flame" size={18} color="$flame" />
          <Box flex={1} gap="xs">
            <Text variant="micro" color="$muted">
              오늘 이 문장대로 한 일
            </Text>
            <Text fontSize={15} fontWeight="700" numberOfLines={2}>
              {todayDeed.text}
            </Text>
          </Box>
          <FeatherIcon name="edit-2" size={15} color="$muted" />
        </Box>
      </Pressable>
    );
  }

  if (!quote) return null;

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel="이 문장대로 한 일 남기기"
      accessibilityHint="한 줄을 남기면 오늘의 불씨를 지필 수 있어요"
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, width: "100%" })}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        bg="$primary"
        height={52}
        borderRadius="pill"
        gap="s"
      >
        <Ionicon name="flame" size={18} color="$onPrimary" />
        <Text color="$onPrimary" fontSize={16} fontWeight="800">
          이 문장대로 한 일 남기기
        </Text>
      </Box>
    </Pressable>
  );
};

export default DeedPrompt;

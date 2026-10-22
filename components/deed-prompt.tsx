// ─────────────────────────────────────────────────────────────
// deed-prompt.tsx — 명언 카드 바로 아래 '오늘 따르는 문장 · 오늘의 한 줄' 자리
// 하루 흐름: 명언을 넘겨 보다가 오늘 이 문장대로 살기로 정한다 → 그 문장대로 산 일을 한 줄 남긴다
// 고르기 → 한 줄 → 불씨로 이어지는 흐름이라 모두 불씨 색을 쓴다. (저장은 회색 책갈피로 따로 둔다)
//   - 아직 정하지 않았으면: 오늘 이 문장대로 살기 버튼
//   - 정한 문장 아래에서는: 이 문장대로 한 일을 남기는 버튼
//   - 다른 문장 아래에서는: 이 문장으로 바꾸는 버튼
//     한 줄을 남긴 뒤라면 바로 바꾸지 않고, 기존 한 줄을 채운 한 줄 쓰기 화면을 열어 새 문장에 맞게 다듬게 한다
//   - 한 줄을 남긴 문장 아래에서는: 오늘 남긴 한 줄 (누르면 고친다)
// 스와이프 영역(quote-swiper.tsx) 안에 놓이므로 Pressable은 react-native-gesture-handler 것을 쓴다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { Deed } from "@/utils/deed";
import { tapHaptic } from "@/utils/haptics";
import { useRouter } from "expo-router";
import { ComponentProps } from "react";
import { Pressable } from "react-native-gesture-handler";
import FeatherIcon, { Ionicon } from "./icon";

type Props = {
  quote: Quote | null;
  todayDeed: Deed | null;
  // 오늘 따르는 문장 (한 줄이 따른 문장 또는 오늘 고른 문장)
  todayQuote: Pick<Quote, "id" | "text" | "author"> | null;
  // 지금 보는 문장을 오늘 따를 문장으로 정하거나 바꾼다
  onPick: (quote: Quote) => void;
};

type PillButtonProps = {
  icon: ComponentProps<typeof Ionicon>["name"];
  // 저장·공유 버튼과 한 줄에 놓여 폭이 좁으므로 짧게 쓴다. (접근성 라벨은 전체 문구)
  label: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  // 꽉 채운 강조 버튼인지 (아니면 테두리만)
  filled: boolean;
  onPress: () => void;
};

const PillButton: React.FC<PillButtonProps> = ({ icon, label, accessibilityLabel, accessibilityHint, filled, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, width: "100%" })}
  >
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      bg={filled ? "$flame" : "$surface"}
      borderWidth={filled ? 0 : 1}
      borderColor="$flame"
      height={52}
      px="md"
      borderRadius="pill"
      gap="s"
    >
      <Ionicon name={icon} size={17} color={filled ? "$onPrimary" : "$flame"} />
      <Text color={filled ? "$onPrimary" : "$flame"} fontSize={15} fontWeight="800" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {label}
      </Text>
    </Box>
  </Pressable>
);

const DeedPrompt: React.FC<Props> = ({ quote, todayDeed, todayQuote, onPick }) => {
  const router = useRouter();

  const open = () => {
    tapHaptic();
    router.push(
      todayDeed || !quote
        ? "/deed"
        : { pathname: "/deed", params: { quoteId: quote.id, text: quote.text, author: quote.author } }
    );
  };

  // 오늘 따르는 문장 아래에서는 오늘 남긴 한 줄 (누르면 고친다)
  if (todayDeed && (!quote || todayDeed.quote.id === quote.id)) {
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
          px="md"
          py="md"
          gap="s"
        >
          <Ionicon name="flame" size={18} color="$flame" />
          <Box flex={1} gap="xs">
            <Text variant="micro" color="$muted" numberOfLines={1}>
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

  const pick = () => {
    tapHaptic();
    onPick(quote);
  };

  // 한 줄을 남긴 뒤에 바꾸면 이 문장과 기존 한 줄로 한 줄 쓰기 화면을 연다. (app/deed.tsx의 문장 바꾸기)
  // 그 화면에서 한 줄을 남겨야 바뀌고, 닫으면 아무것도 바뀌지 않는다.
  const changeWithDeed = () => {
    tapHaptic();
    router.push({ pathname: "/deed", params: { quoteId: quote.id, text: quote.text, author: quote.author } });
  };

  if (todayQuote?.id === quote.id) {
    return (
      <PillButton
        icon="flame"
        label="문장대로 한 일 남기기"
        accessibilityLabel="이 문장대로 한 일 남기기"
        accessibilityHint="한 줄을 남기면 오늘의 불씨를 지필 수 있어요"
        filled
        onPress={open}
      />
    );
  }

  if (todayQuote) {
    return (
      <PillButton
        icon="swap-horizontal"
        label="이 문장으로 바꾸기"
        accessibilityLabel="오늘 따를 문장을 이 문장으로 바꾸기"
        accessibilityHint={`지금 따르는 문장은 ‘${todayQuote.text}’예요`}
        filled={false}
        onPress={todayDeed ? changeWithDeed : pick}
      />
    );
  }

  return (
    <PillButton
      icon="flame"
      label="오늘 이 문장대로 살기"
      accessibilityLabel="오늘 이 문장대로 살기"
      accessibilityHint="정한 문장대로 산 일을 오늘 안에 한 줄 남겨요"
      filled
      onPress={pick}
    />
  );
};

export default DeedPrompt;

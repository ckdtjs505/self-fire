// ─────────────────────────────────────────────────────────────
// deed-prompt.tsx — 명언 카드 바로 아래 '오늘 따르는 문장 · 오늘 할 일' 자리
// 하루 흐름: 오늘 이 문장대로 살기로 정한다 → 그 문장대로 할 일 한 가지를 정한다 → 해내면 완료 → 불씨
// 고르기 → 할 일 → 완료 → 불씨로 이어지는 흐름이라 모두 불씨 색을 쓴다. (저장은 회색 책갈피로 따로 둔다)
//   - 아직 정하지 않았으면: 오늘 이 문장대로 살기 버튼
//   - 정한 문장 아래에서는: 오늘 이 문장대로 할 일 정하기 버튼
//   - 할 일을 정했으면: 할 일 카드 (크게, 자르지 않고) + 완료 버튼. 할 일을 누르면 고친다
//   - 완료했으면: 오늘 해낸 일 카드 (그날 기록으로 굳어 고치지 않는다)
//   - 다른 문장 아래에서는: 이 문장으로 바꾸는 버튼 (완료 전까지만)
//     할 일을 정한 뒤라면 바로 바꾸지 않고, 기존 할 일을 채운 할 일 쓰기 화면을 열어 새 문장에 맞게 다듬게 한다
// 스와이프 영역(quote-swiper.tsx) 안에 놓이므로 Pressable은 react-native-gesture-handler 것을 쓴다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { Deed, isDeedDone } from "@/utils/deed";
import { tapHaptic } from "@/utils/haptics";
import { useRouter } from "expo-router";
import { ComponentProps } from "react";
import { Pressable } from "react-native-gesture-handler";
import FeatherIcon, { Ionicon } from "./icon";

type Props = {
  quote: Quote | null;
  todayDeed: Deed | null;
  // 오늘 따르는 문장 (할 일이 따른 문장 또는 오늘 고른 문장)
  todayQuote: Pick<Quote, "id" | "text" | "author"> | null;
  // 지금 보는 문장을 오늘 따를 문장으로 정하거나 바꾼다
  onPick: (quote: Quote) => void;
  // 오늘 할 일을 해냈다 (완료 → 불씨 점화)
  onComplete: () => void;
  // 화면 폭 전체를 쓰는 자리이면 true (오늘 따르는 문장 화면). 할 일을 더 크게, 버튼 문구를 온전히 보여 준다.
  wide?: boolean;
};

type PillButtonProps = {
  icon: ComponentProps<typeof Ionicon>["name"];
  // 저장·공유 버튼과 한 줄에 놓이면 폭이 좁으므로 짧게 쓴다. (접근성 라벨은 전체 문구)
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

// 오늘 할 일 카드. 이 앱의 주인공이라 자르지 않고 전부 보여 주고, 불씨 색 테두리로 명언 다음에 바로 눈이 가게 한다.
// 완료 전: 할 일을 누르면 고치고, 아래 완료 버튼으로 해냈다고 표시한다.
// 완료 후: 오늘 해낸 일로 굳는다.
const TodayTaskCard: React.FC<{ deed: Deed; wide: boolean; onEdit: () => void; onComplete: () => void }> = ({
  deed,
  wide,
  onEdit,
  onComplete,
}) => {
  const done = isDeedDone(deed);
  const taskText = (
    <Text fontSize={wide ? 21 : 16} lineHeight={wide ? 30 : 23} fontWeight="800">
      {deed.text}
    </Text>
  );

  return (
    <Box bg="$surface" borderWidth={1.5} borderColor="$flame" borderRadius="lg" px="lg" py="md" style={{ gap: 10 }}>
      {done ? (
        <Box accessible accessibilityLabel={`오늘 이 문장대로 해낸 일: ${deed.text}`} style={{ gap: 6 }}>
          <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
            <Ionicon name="checkmark-circle" size={17} color="$flame" />
            <Text fontSize={13} fontWeight="800" color="$muted">
              오늘 이 문장대로 해낸 일
            </Text>
          </Box>
          {taskText}
        </Box>
      ) : (
        <>
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`오늘 이 문장대로 할 일: ${deed.text}`}
            accessibilityHint="눌러서 고칠 수 있어요"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, gap: 6 })}
          >
            <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
              <Ionicon name="flame" size={16} color="$flame" />
              <Text fontSize={13} fontWeight="800" color="$muted" style={{ flex: 1 }}>
                오늘 이 문장대로 할 일
              </Text>
              <FeatherIcon name="edit-2" size={15} color="$muted" />
            </Box>
            {taskText}
          </Pressable>
          <Pressable
            onPress={onComplete}
            accessibilityRole="button"
            accessibilityLabel="오늘 할 일 완료"
            accessibilityHint="해냈다면 눌러서 오늘의 불씨를 지펴요"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              bg="$flame"
              height={48}
              borderRadius="pill"
              gap="s"
            >
              <Ionicon name="checkmark" size={19} color="$onPrimary" />
              <Text color="$onPrimary" fontSize={16} fontWeight="800">
                완료
              </Text>
            </Box>
          </Pressable>
        </>
      )}
    </Box>
  );
};

const DeedPrompt: React.FC<Props> = ({ quote, todayDeed, todayQuote, onPick, onComplete, wide = false }) => {
  const router = useRouter();

  const open = () => {
    tapHaptic();
    router.push(
      todayDeed || !quote
        ? "/deed"
        : { pathname: "/deed", params: { quoteId: quote.id, text: quote.text, author: quote.author } }
    );
  };

  const complete = () => {
    tapHaptic();
    onComplete();
  };

  // 오늘 따르는 문장 아래에서는 오늘 할 일
  if (todayDeed && (!quote || todayDeed.quote.id === quote.id)) {
    return <TodayTaskCard deed={todayDeed} wide={wide} onEdit={open} onComplete={complete} />;
  }

  // 완료한 날은 문장을 바꾸지 않는다.
  if (!quote || (todayDeed && isDeedDone(todayDeed))) return null;

  const pick = () => {
    tapHaptic();
    onPick(quote);
  };

  // 할 일을 정한 뒤에 바꾸면 이 문장과 기존 할 일로 할 일 쓰기 화면을 연다. (app/deed.tsx의 문장 바꾸기)
  // 그 화면에서 할 일을 남겨야 바뀌고, 닫으면 아무것도 바뀌지 않는다.
  const changeWithDeed = () => {
    tapHaptic();
    router.push({ pathname: "/deed", params: { quoteId: quote.id, text: quote.text, author: quote.author } });
  };

  if (todayQuote?.id === quote.id) {
    return (
      <PillButton
        icon="flame"
        label={wide ? "오늘 이 문장대로 할 일 정하기" : "할 일 정하기"}
        accessibilityLabel="오늘 이 문장대로 할 일 정하기"
        accessibilityHint="할 일 한 가지를 정하고, 해내면 완료를 눌러 오늘의 불씨를 지펴요"
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
      accessibilityHint="이 문장대로 할 일 한 가지를 정하고 하루를 지내요"
      filled
      onPress={pick}
    />
  );
};

export default DeedPrompt;

// ─────────────────────────────────────────────────────────────
// app/deed.tsx
// 오늘 이 문장대로 할 일 한 가지를 정하는 화면. (/deed)
// - 홈 화면에서 지금 보고 있는 명언(quoteId, text, author)을 넘겨 받는다.
// - 오늘 이미 정한 할 일이 있으면 그 할 일과 그때 따른 문장으로 고치기 모드가 된다. (완료하면 고치지 않는다)
// - 할 일을 정한 뒤 다른 문장을 넘겨 받으면 문장 바꾸기 모드: 새 문장 아래에 기존 할 일을 채워 두고,
//   새 문장에 맞게 다듬어 남기면 오늘 따르는 문장과 할 일이 함께 바뀐다. (닫으면 아무것도 바뀌지 않는다)
// - 할 일을 정해도 불씨는 아직이다. 하루를 지내며 해내고 홈에서 완료를 누르면 그때 점화한다. (app/(navi)/index.tsx)
// - 고친 내용이 있는데 닫으면 버릴지 한 번 묻는다
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import FeatherIcon from "@/components/icon";
import ScreenHeader from "@/components/screen-header";
import { useDeedStore, useTodayDeed } from "@/store/deed";
import { useAppTheme } from "@/themes";
import { trackEvent } from "@/utils/analytics";
import { DEED_MAX_LENGTH, normalizeDeedText } from "@/utils/deed";
import { usePreventRemove } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import Toast from "react-native-toast-message";

// 무엇을 쓰면 될지 감을 주는 예시 (매번 하나)
const PLACEHOLDERS = [
  "예) 미뤄 둔 전화 오늘 걸기",
  "예) 엘리베이터 대신 계단으로 오르기",
  "예) 동료의 말을 끝까지 듣기",
  "예) 자기 전에 10분 책 읽기",
];

export default function DeedScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ quoteId?: string; text?: string; author?: string }>();

  const todayDeed = useTodayDeed();
  const saveToday = useDeedStore((s) => s.saveToday);
  const paramQuote = { id: params.quoteId ?? "", text: params.text ?? "", author: params.author ?? "" };
  // 한 줄을 남긴 뒤 다른 문장을 넘겨 받았으면 그 문장으로 바꾸는 중이다.
  const isChangingQuote = !!todayDeed && !!paramQuote.id && paramQuote.id !== todayDeed.quote.id;
  const isEditing = !!todayDeed && !isChangingQuote;
  // 고칠 때는 그날 따른 문장을 그대로, 바꿀 때는 새 문장을 보여 준다.
  const quote = isEditing ? todayDeed.quote : paramQuote;

  const [text, setText] = useState(todayDeed?.text ?? "");
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const [focused, setFocused] = useState(false);
  const isSaving = useRef(false);
  const canSave = normalizeDeedText(text).length > 0 && !!quote.id;
  const isDirty = text !== (todayDeed?.text ?? "");

  usePreventRemove(isDirty, ({ data }) => {
    if (isSaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    Alert.alert("작성 중인 한 줄이 있어요", "남기지 않고 닫을까요?", [
      { text: "계속 쓰기", style: "cancel" },
      { text: "버리기", style: "destructive", onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const handleSave = () => {
    if (!canSave) {
      Toast.show({ type: "error", text2: "오늘 이 문장대로 할 일을 한 가지 적어 주세요" });
      return;
    }
    const deed = saveToday(quote, text);
    if (!deed) return;
    isSaving.current = true;
    trackEvent("deed_save", { edit: !!todayDeed, change_quote: isChangingQuote, length: deed.text.length });
    // 돌아간 홈 화면에 바뀐 할 일·문장이 바로 보이므로 토스트는 띄우지 않는다.
    router.back();
  };

  return (
    <SafeAreaView flex={1} backgroundColor="$background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScreenHeader
          title={isChangingQuote ? "새 문장으로 할 일 다듬기" : isEditing ? "오늘 할 일 고치기" : "오늘 할 일 한 가지"}
          backIcon="x"
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 따라 산 문장 ── */}
          <Box bg="$surfaceMuted" borderRadius="lg" padding="lg" gap="s" marginBottom="xl">
            <Text variant="overline">이 문장대로</Text>
            <Text fontSize={17} lineHeight={27} fontWeight="700">
              {`“${quote.text}”`}
            </Text>
            {!!quote.author && <Text variant="caption">— {quote.author}</Text>}
          </Box>

          {/* ── 한 줄 입력 ── */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="flex-end" marginBottom="s" marginLeft="xs">
            <Text variant="overline">오늘 이 문장대로 할 일</Text>
            <Text variant="caption" fontSize={12} style={{ fontVariant: ["tabular-nums"] }}>
              {text.length}/{DEED_MAX_LENGTH}
            </Text>
          </Box>
          <Box
            bg="$surface"
            borderRadius="lg"
            padding="lg"
            borderWidth={1.5}
            borderColor={focused ? "$flame" : "$border"}
          >
            <TextInput
              autoFocus
              multiline
              submitBehavior="blurAndSubmit"
              returnKeyType="done"
              maxLength={DEED_MAX_LENGTH}
              placeholder={placeholder}
              placeholderTextColor={colors.$muted}
              selectionColor={colors.$flame}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSave}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              accessibilityLabel="오늘 이 문장대로 할 일"
              style={[styles.input, { color: colors.$foreground }]}
              textAlignVertical="top"
            />
          </Box>

          {/* 안내는 하나만: 문장을 바꾸는 중이면 지금 한 줄이 이전 문장대로 쓴 것임을, 아니면 부담을 덜어 주는 말 */}
          <Box flexDirection="row" bg="$surfaceMuted" borderRadius="md" padding="md" gap="s" marginTop="lg">
            {isChangingQuote ? (
              <FeatherIcon name="repeat" size={14} color="$muted" style={{ marginTop: 2 }} />
            ) : (
              <Text fontSize={13}>🔥</Text>
            )}
            <Text variant="caption" lineHeight={19} style={{ flex: 1 }}>
              {isChangingQuote
                ? "지금 할 일은 이전 문장에 맞춰 정한 거예요. 새 문장에 맞게 다듬어 주세요."
                : "크지 않아도 괜찮아요. 오늘 해낼 수 있는 작은 일 하나면 돼요. 해내고 완료를 누르면 불씨가 켜져요."}
            </Text>
          </Box>
        </ScrollView>

        <Box px="lg" pb="lg" pt="s">
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            style={({ pressed }) => ({ opacity: !canSave ? 0.45 : pressed ? 0.8 : 1 })}
          >
            <Box height={52} borderRadius="pill" bg="$flame" justifyContent="center" alignItems="center">
              <Text color="$onPrimary" fontSize={16} fontWeight="800">
                {isChangingQuote ? "이 문장으로 바꾸기" : isEditing ? "고치기" : "할 일 정하기"}
              </Text>
            </Box>
          </Pressable>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 18,
    lineHeight: 28,
    minHeight: 84,
    padding: 0,
  },
});

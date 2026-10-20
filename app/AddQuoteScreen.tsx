// ─────────────────────────────────────────────────────────────
// AddQuoteScreen.tsx
// 사용자가 직접 명언을 추가하거나 기존 명언을 수정하는 화면.
// - URL 파라미터(id, text, author)가 있으면 수정 모드로 동작
// - 없으면 신규 추가 모드로 동작
// - KeyboardAvoidingView로 iOS 키보드 가림 현상 방지
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import ScreenHeader from "@/components/screen-header";
import { useFavoriteQuoteStore } from "@/store/quote";
import { useThemeStore } from "@/store/theme";
import { trackEvent } from "@/utils/analytics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AddQuoteScreen() {
  const router = useRouter();

  // URL 파라미터에서 수정 대상 명언 정보를 받아온다.
  // id가 존재하면 수정 모드, 없으면 추가 모드.
  const params = useLocalSearchParams<{ id?: string; text?: string; author?: string }>();
  const isEditing = !!params.id;

  // 명언 추가/수정 함수를 전역 스토어에서 가져온다.
  const { addCustomQuote, updateCustomQuote } = useFavoriteQuoteStore();
  const { colors } = useThemeStore().currentTheme;
  // 지금 입력 중인 칸 (테두리를 강조색으로 표시)
  const [focused, setFocused] = useState<"text" | "author" | null>(null);

  // 명언 내용과 작성자 입력 상태 관리
  // 수정 모드이면 기존 값으로 초기화한다.
  const [text, setText] = useState(params.text || "");
  const [author, setAuthor] = useState(params.author || "");

  // ── handleSave ────────────────────────────────────────────
  // 저장 버튼 클릭 시 호출된다.
  // 유효성 검사 후 추가 또는 수정 스토어 함수를 호출하고, 이전 화면으로 돌아간다.
  const handleSave = () => {
    // 명언 내용 필수 입력 검사
    if (!text.trim()) {
      Toast.show({ type: "error", text1: "알림", text2: "명언 내용을 입력해주세요." });
      return;
    }
    // 작성자/출처 필수 입력 검사
    if (!author.trim()) {
      Toast.show({ type: "error", text1: "알림", text2: "작성자(또는 출처)를 입력해주세요." });
      return;
    }

    if (params.id) {
      // 수정 모드: 기존 명언 업데이트
      updateCustomQuote(params.id, text, author);
      trackEvent("quote_edit");
      Toast.show({ type: "success", text1: "성공", text2: "명언이 수정되었습니다." });
    } else {
      // 추가 모드: 새 명언 등록
      addCustomQuote(text, author);
      trackEvent("quote_add");
      Toast.show({ type: "success", text1: "성공", text2: "새로운 명언이 등록되었습니다." });
    }
    router.back(); // 저장 완료 후 이전 화면으로 이동
  };

  return (
    <SafeAreaView flex={1} backgroundColor="$background">
      {/* iOS에서 키보드가 올라올 때 화면이 밀리도록 처리 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* 화면 바깥 터치 시 키보드 닫기 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box flex={1}>
            {/* ── Header: 닫기 / 화면 제목 / 저장 ── */}
            <ScreenHeader
              title={isEditing ? "명언 수정" : "명언 추가"}
              backIcon="x"
              right={
                <Pressable onPress={handleSave} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                  <Box bg="$primary" borderRadius="pill" height={38} px="lg" justifyContent="center">
                    <Text color="$onPrimary" fontSize={14} fontWeight="800">
                      저장
                    </Text>
                  </Box>
                </Pressable>
              }
            />

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12 }}
              keyboardShouldPersistTaps="handled" // 스크롤 중 탭해도 키보드가 닫히지 않게
            >
              {/* ── 명언 내용 입력 영역 ────────────────────── */}
              <Box marginBottom="xl">
                <Box flexDirection="row" justifyContent="space-between" alignItems="flex-end" marginBottom="s" marginLeft="xs">
                  <Text variant="overline">내용</Text>
                  <Text variant="caption" fontSize={12} style={{ fontVariant: ["tabular-nums"] }}>
                    {text.length}자
                  </Text>
                </Box>
                <Box
                  bg="$surface"
                  borderRadius="lg"
                  padding="lg"
                  minHeight={170}
                  borderWidth={1.5}
                  borderColor={focused === "text" ? "$primary" : "$border"}
                >
                  <TextInput
                    multiline                        // 여러 줄 입력 허용
                    placeholder="가슴을 뛰게 하는 명언을 입력하세요."
                    placeholderTextColor={colors.$muted}
                    selectionColor={colors.$primary}
                    value={text}
                    onChangeText={setText}
                    onFocus={() => setFocused("text")}
                    onBlur={() => setFocused(null)}
                    style={[styles.textArea, { color: colors.$foreground }]}
                    textAlignVertical="top"          // Android: 텍스트를 상단 정렬
                  />
                </Box>
              </Box>

              {/* ── 작성자/출처 입력 영역 ──────────────────── */}
              <Box marginBottom="xl">
                <Text variant="overline" marginBottom="s" marginLeft="xs">
                  작성자 / 출처
                </Text>
                <Box
                  bg="$surface"
                  borderRadius="lg"
                  paddingHorizontal="lg"
                  height={54}
                  justifyContent="center"
                  borderWidth={1.5}
                  borderColor={focused === "author" ? "$primary" : "$border"}
                >
                  <TextInput
                    placeholder="이름 또는 출처를 입력하세요."
                    placeholderTextColor={colors.$muted}
                    selectionColor={colors.$primary}
                    value={author}
                    onChangeText={setAuthor}
                    onFocus={() => setFocused("author")}
                    onBlur={() => setFocused(null)}
                    style={[styles.input, { color: colors.$foreground }]}
                  />
                </Box>
              </Box>

              {/* ── 안내 문구 ──────────────────────────────── */}
              <Box flexDirection="row" bg="$surfaceMuted" borderRadius="md" padding="md" style={{ gap: 8 }}>
                <Text fontSize={13}>💡</Text>
                <Text variant="caption" lineHeight={19} style={{ flex: 1 }}>
                  등록된 명언은 메인 화면의 명언 목록에 포함되어 무작위로 나타납니다.
                </Text>
              </Box>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── StyleSheet ────────────────────────────────────────────────
const styles = StyleSheet.create({
  // 명언 내용 멀티라인 입력창
  textArea: {
    fontSize: 18,
    lineHeight: 28,
    minHeight: 130,
    textAlignVertical: "top",
    padding: 0,
  },
  // 작성자/출처 단일 라인 입력창
  input: {
    fontSize: 16,
    padding: 0,
  }
});

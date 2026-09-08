// ─────────────────────────────────────────────────────────────
// AddQuoteScreen.tsx
// 사용자가 직접 명언을 추가하거나 기존 명언을 수정하는 화면.
// - URL 파라미터(id, text, author)가 있으면 수정 모드로 동작
// - 없으면 신규 추가 모드로 동작
// - KeyboardAvoidingView로 iOS 키보드 가림 현상 방지
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { Box, SafeAreaView, Text } from "@/atom";
import { useFavoriteQuoteStore } from "@/store/quote";
import { TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import FeatherIcon from "@/components/icon";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from 'react-native-toast-message';

export default function AddQuoteScreen() {
  const router = useRouter();

  // URL 파라미터에서 수정 대상 명언 정보를 받아온다.
  // id가 존재하면 수정 모드, 없으면 추가 모드.
  const params = useLocalSearchParams<{ id?: string; text?: string; author?: string }>();
  const isEditing = !!params.id;

  // 명언 추가/수정 함수를 전역 스토어에서 가져온다.
  const { addCustomQuote, updateCustomQuote } = useFavoriteQuoteStore();

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
      Toast.show({ type: 'error', text1: '알림', text2: '명언 내용을 입력해주세요.' });
      return;
    }
    // 작성자/출처 필수 입력 검사
    if (!author.trim()) {
      Toast.show({ type: 'error', text1: '알림', text2: '작성자(또는 출처)를 입력해주세요.' });
      return;
    }

    if (isEditing && params.id) {
      // 수정 모드: 기존 명언 업데이트
      updateCustomQuote(params.id, text, author);
      Toast.show({ type: 'success', text1: '성공', text2: '명언이 수정되었습니다.' });
    } else {
      // 추가 모드: 새 명언 등록
      addCustomQuote(text, author);
      Toast.show({ type: 'success', text1: '성공', text2: '새로운 명언이 등록되었습니다.' });
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
            {/* ── Header ─────────────────────────────────────
                좌: 닫기 버튼 / 중앙: 화면 제목 / 우: 저장 버튼 */}
            <Box 
              flexDirection="row" 
              alignItems="center" 
              padding="md" 
              justifyContent="space-between"
              borderBottomWidth={1}
              borderBottomColor="$headerBackground"
              backgroundColor="$background"
            >
              {/* 닫기 버튼: 이전 화면으로 돌아간다 */}
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <FeatherIcon name="x" size={24} color="$foreground" />
              </Pressable>
              {/* 화면 제목: 수정 모드에 따라 문구가 달라진다 */}
              <Text fontSize={18} fontWeight="bold" color="$foreground">
                {isEditing ? "명언 수정" : "명언 추가"}
              </Text>
              {/* 저장 버튼 */}
              <Pressable onPress={handleSave} style={styles.headerButton}>
                <Text fontSize={18} fontWeight="bold" color="$primary">저장</Text>
              </Pressable>
            </Box>

            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled" // 스크롤 중 탭해도 키보드가 닫히지 않게
            >
              {/* ── 명언 내용 입력 영역 ────────────────────── */}
              <Box marginBottom="xl">
                <Text fontSize={14} fontWeight="600" marginBottom="s" style={{ opacity: 0.6 }}>내용</Text>
                <Box 
                  backgroundColor="$sidebarBackground"
                  borderRadius="md"
                  padding="md"
                  minHeight={150}
                >
                  <TextInput
                    multiline                        // 여러 줄 입력 허용
                    placeholder="가슴을 뛰게 하는 명언을 입력하세요."
                    placeholderTextColor="#999"
                    value={text}
                    onChangeText={setText}
                    style={styles.textArea}
                    textAlignVertical="top"          // Android: 텍스트를 상단 정렬
                  />
                </Box>
              </Box>

              {/* ── 작성자/출처 입력 영역 ──────────────────── */}
              <Box marginBottom="xl">
                <Text fontSize={14} fontWeight="600" marginBottom="s" style={{ opacity: 0.6 }}>작성자 / 출처</Text>
                <Box 
                  backgroundColor="$sidebarBackground"
                  borderRadius="md"
                  padding="md"
                >
                  <TextInput
                    placeholder="이름 또는 출처를 입력하세요."
                    placeholderTextColor="#999"
                    value={author}
                    onChangeText={setAuthor}
                    style={styles.input}
                  />
                </Box>
              </Box>

              {/* ── 안내 문구 ──────────────────────────────── */}
              <Box paddingVertical="xl" alignItems="center">
                <Text fontSize={12} style={{ opacity: 0.5, textAlign: 'center', lineHeight: 18 }}>
                  등록된 명언은 메인 화면의 슬라이드 리스트에{"\n"}포함되어 무작위로 나타나게 됩니다.
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
  // 헤더 좌/우 버튼의 터치 영역을 넓히기 위한 패딩
  headerButton: {
    padding: 4,
  },
  // 명언 내용 멀티라인 입력창
  textArea: {
    color: "white",
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  // 작성자/출처 단일 라인 입력창
  input: {
    color: "white",
    fontSize: 16,
    padding: 0,
  }
});

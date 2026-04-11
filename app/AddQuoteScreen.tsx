import React, { useState, useEffect } from "react";
import { Box, SafeAreaView, Text } from "@/atom";
import { useFavoriteQuoteStore } from "@/store/quote";
import { TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import FeatherIcon from "@/components/icon";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AddQuoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; text?: string; author?: string }>();
  const isEditing = !!params.id;

  const { addCustomQuote, updateCustomQuote } = useFavoriteQuoteStore();
  
  const [text, setText] = useState(params.text || "");
  const [author, setAuthor] = useState(params.author || "");

  const handleSave = () => {
    if (!text.trim()) {
      Alert.alert("알림", "명언 내용을 입력해주세요.");
      return;
    }
    if (!author.trim()) {
      Alert.alert("알림", "작성자(또는 출처)를 입력해주세요.");
      return;
    }

    if (isEditing && params.id) {
      updateCustomQuote(params.id, text, author);
      Alert.alert("성공", "명언이 수정되었습니다.");
    } else {
      addCustomQuote(text, author);
      Alert.alert("성공", "새로운 명언이 등록되었습니다.");
    }
    router.back();
  };

  return (
    <SafeAreaView flex={1} backgroundColor="$background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box flex={1}>
            {/* Header */}
            <Box 
              flexDirection="row" 
              alignItems="center" 
              padding="md" 
              justifyContent="space-between"
              borderBottomWidth={1}
              borderBottomColor="$headerBackground"
              backgroundColor="$background"
            >
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <FeatherIcon name="x" size={24} color="$foreground" />
              </Pressable>
              <Text fontSize={18} fontWeight="bold" color="$foreground">
                {isEditing ? "명언 수정" : "명언 추가"}
              </Text>
              <Pressable onPress={handleSave} style={styles.headerButton}>
                <Text fontSize={18} fontWeight="bold" color="$primary">저장</Text>
              </Pressable>
            </Box>

            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <Box marginBottom="xl">
                <Text fontSize={14} fontWeight="600" marginBottom="s" style={{ opacity: 0.6 }}>내용</Text>
                <Box 
                  backgroundColor="$sidebarBackground"
                  borderRadius="md"
                  padding="md"
                  minHeight={150}
                >
                  <TextInput
                    multiline
                    placeholder="가슴을 뛰게 하는 명언을 입력하세요."
                    placeholderTextColor="#999"
                    value={text}
                    onChangeText={setText}
                    style={styles.textArea}
                    textAlignVertical="top"
                  />
                </Box>
              </Box>

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

const styles = StyleSheet.create({
  headerButton: {
    padding: 4,
  },
  textArea: {
    color: "white",
    fontSize: 18,
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  input: {
    color: "white",
    fontSize: 16,
    padding: 0,
  }
});

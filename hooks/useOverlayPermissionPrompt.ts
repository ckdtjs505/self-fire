import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as IntentLauncher from "expo-intent-launcher";

const HAS_PROMPTED_KEY = "hasPromptedOverlay";
const PROMPT_DELAY_MS = 1000; // 화면 로딩이 안정된 뒤에 띄운다

/**
 * (Android) 앱 최초 실행 시 '다른 앱 위에 표시' 권한을 한 번만 안내한다.
 * 잠금 해제 시 명언을 자동으로 띄우는 기능에 필요한 권한이다.
 */
export const useOverlayPermissionPrompt = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const markPrompted = () => AsyncStorage.setItem(HAS_PROMPTED_KEY, "true");

    const prompt = async () => {
      try {
        const hasPrompted = await AsyncStorage.getItem(HAS_PROMPTED_KEY);
        if (hasPrompted) return;

        Alert.alert(
          "화면 자동 켜짐 설정",
          "휴대폰 잠금 해제 시 명언을 자동으로 띄우려면 '다른 앱 위에 표시' 권한이 필요합니다. 설정 화면으로 이동하시겠습니까?",
          [
            { text: "나중에", style: "cancel", onPress: markPrompted },
            {
              text: "설정하러 가기",
              onPress: async () => {
                await markPrompted();
                IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_OVERLAY_PERMISSION);
              },
            },
          ]
        );
      } catch (e) {
        console.error(e);
      }
    };

    const timer = setTimeout(prompt, PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
};

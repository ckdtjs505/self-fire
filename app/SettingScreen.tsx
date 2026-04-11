import { Box, SafeAreaView, Text } from "@/atom";
import { useEffect, useState } from "react";
import * as Application from "expo-application";
import SettingItem from "@/components/setting-item";
import { Linking, ScrollView, Switch, NativeModules, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAdStore } from "@/store/ad-store";

const { AutoLaunchModule } = NativeModules;

export default function SettingScreen() {
  const router = useRouter();
  const [appVersion, setAppVersion] = useState("");
  const [isAutoLaunchEnabled, setIsAutoLaunchEnabled] = useState(true);
  const { isAdFree, setAdFree } = useAdStore();

  useEffect(() => {
    setAppVersion(Application.nativeApplicationVersion || "1.0.0");
    
    // 초기 설정값 로드 (안드로이드인 경우에만)
    if (Platform.OS === "android" && AutoLaunchModule) {
      AutoLaunchModule.isEnabled().then((enabled: boolean) => {
        setIsAutoLaunchEnabled(enabled);
      });
    }
  }, []);

  const toggleAutoLaunch = async () => {
    if (Platform.OS === "android" && AutoLaunchModule) {
      const newValue = !isAutoLaunchEnabled;
      try {
        await AutoLaunchModule.setEnabled(newValue);
        setIsAutoLaunchEnabled(newValue);
      } catch (e) {
        console.error("Failed to toggle auto launch", e);
      }
    }
  };

  const handleRemoveAds = () => {
    if (isAdFree) {
      Alert.alert("알림", "이미 광고 제거 기능이 활성화되어 있습니다.");
      return;
    }

    Alert.alert(
      "광고 제거",
      "990원을 결제하여 광고를 영구적으로 제거하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "결제하기", 
          onPress: () => {
            // 실제 IAP 연동 시점을 위한 Mock 처리
            setAdFree(true);
            Alert.alert("완료", "광고 제거 기능이 활성화되었습니다.");
          } 
        }
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const navigateToLegal = (screen: "PrivacyScreen" | "TermsScreen") => {
    router.push(`/${screen}`);
  };

  return (
    <SafeAreaView flex={1}>
      <Box backgroundColor={"$background"} flex={1}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text fontSize={24} fontWeight="bold" marginBottom="xl" marginTop="s">
            설정
          </Text>

          {/* 일반 섹션 */}
          <Box marginBottom="lg">
            <Text
              fontSize={14}
              fontWeight="600"
              color={"$foreground"}
              marginBottom="s"
              marginLeft="s"
              style={{ opacity: 0.6 }}
            >
              서비스
            </Text>
            <Box
              bg={"$sidebarBackground"}
              borderRadius={"md"}
              overflow="hidden"
            >
              {Platform.OS === "android" && (
                <>
                  <SettingItem
                    icon={"zap"}
                    title="잠금 해제 시 자동 실행"
                    handleClickItem={toggleAutoLaunch}
                    rightElement={
                      <Switch
                        value={isAutoLaunchEnabled}
                        onValueChange={toggleAutoLaunch}
                        trackColor={{ false: "#767577", true: "#2185d0" }}
                        thumbColor={isAutoLaunchEnabled ? "#ffffff" : "#f4f3f4"}
                      />
                    }
                  />
                  <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
                </>
              )}
              <SettingItem
                icon={"help-circle"}
                title="자주 묻는 질문"
                handleClickItem={() =>
                  openLink("https://workshop-code.tistory.com/107")
                }
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              <SettingItem
                icon={"shopping-cart"}
                title="광고 제거"
                handleClickItem={handleRemoveAds}
                rightElement={
                  isAdFree ? (
                    <Text fontSize={14} color={"$primary"} fontWeight="bold">
                      활성화됨
                    </Text>
                  ) : (
                    <Text fontSize={14} style={{ opacity: 0.6 }}>
                      ₩990
                    </Text>
                  )
                }
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              <SettingItem
                icon={"star"}
                title="응원의 리뷰 쓰기"
                handleClickItem={() => console.log("click")}
              />
            </Box>
          </Box>

          {/* 앱 정보 섹션 */}
          <Box marginBottom="lg">
            <Text
              fontSize={14}
              fontWeight="600"
              color={"$foreground"}
              marginBottom="s"
              marginLeft="s"
              style={{ opacity: 0.6 }}
            >
              앱 정보
            </Text>
            <Box
              bg={"$sidebarBackground"}
              borderRadius={"md"}
              overflow="hidden"
            >
              <SettingItem
                icon={"shield"}
                title="개인정보 처리방침"
                handleClickItem={() => navigateToLegal("PrivacyScreen")}
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              <SettingItem
                icon={"file-text"}
                title="서비스 이용약관"
                handleClickItem={() => navigateToLegal("TermsScreen")}
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              <SettingItem
                icon={"info"}
                title="버전 정보"
                handleClickItem={() => {}}
                rightElement={
                  <Text color={"$sidebarForeground"} style={{ opacity: 0.6 }}>
                    {appVersion}
                  </Text>
                }
              />
            </Box>
          </Box>

          <Box paddingVertical="xl" alignItems="center">
            <Text fontSize={12} color={"$foreground"} style={{ opacity: 0.4 }}>
              © 2024 Self-Fire. All rights reserved.
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

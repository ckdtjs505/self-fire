// ─────────────────────────────────────────────────────────────
// SettingScreen.tsx
// 앱 설정 화면.
// 주요 섹션:
//   - 알림: 오늘의 명언 알림 ON/OFF, 알림 시간(시/분) 조정
//   - 서비스: 나만의 명언 관리, 잠금 해제 시 자동 실행(Android),
//             자주 묻는 질문, 광고 제거, 응원의 리뷰
//   - 앱 정보: 개인정보 처리방침, 서비스 이용약관, 버전 정보
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Application from "expo-application";
import SettingItem from "@/components/setting-item";
import { AppState, AppStateStatus, Linking, ScrollView, Switch, NativeModules, Platform, Alert, ToastAndroid } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Toast from 'react-native-toast-message';
import { useAdStore } from "@/store/ad-store";
import { useNotificationStore } from "@/store/notification";

// Android 네이티브 모듈: 잠금 해제 자동 실행 기능을 위한 오버레이 권한 처리
const { AutoLaunchModule } = NativeModules;

export default function SettingScreen() {
  const router = useRouter();

  // 앱 버전 표시를 위한 상태 (expo-application으로 읽어온다)
  const [appVersion, setAppVersion] = useState("");

  // 잠금 해제 시 자동 실행 토글 상태 (Android 전용)
  const [isAutoLaunchEnabled, setIsAutoLaunchEnabled] = useState(false);

  // 광고 제거 여부를 전역 스토어에서 관리
  const { isAdFree, setAdFree } = useAdStore();

  // 알림 설정: 활성화 여부, 시간(시/분)을 전역 스토어에서 관리
  const { isEnabled: isNotificationEnabled, notificationHour, notificationMinute, setEnabled: setNotificationEnabled, setTime } = useNotificationStore();

  // 알림 시간 UI 입력 상태 (시/분 - / + 버튼으로 조정)
  const [hourInput, setHourInput] = useState(notificationHour);
  const [minuteInput, setMinuteInput] = useState(notificationMinute);

  // 사용자가 오버레이 권한 설정 화면으로 이동했는지 여부를 추적하는 ref
  // true이면 앱으로 돌아왔을 때 권한 결과를 확인한다.
  const pendingPermissionCheck = useRef(false);

  // 앱 버전을 컴포넌트 마운트 시 한 번 읽어온다.
  useEffect(() => {
    setAppVersion(Application.nativeApplicationVersion || "1.0.0");
  }, []);

  /**
   * 권한 상태와 토글 상태를 동기화하는 공통 함수.
   * - pendingPermissionCheck: true  → 우리가 설정 화면으로 보낸 경우 (토글 ON 시도)
   * - pendingPermissionCheck: false → 일반 복귀 or 화면 진입 (권한 해지 감지)
   */
  const syncPermissionState = useCallback(async (fromPending = false) => {
    // Android이 아니거나 AutoLaunchModule이 없으면 실행하지 않는다.
    if (Platform.OS !== "android" || !AutoLaunchModule) return;

    const hasPermission: boolean = await AutoLaunchModule.hasOverlayPermission();

    if (fromPending) {
      // 사용자가 토글 ON을 위해 설정 화면으로 이동했다가 돌아온 경우
      if (hasPermission) {
        // 권한을 허용했으면 자동 실행을 활성화한다.
        await AutoLaunchModule.setEnabled(true);
        setIsAutoLaunchEnabled(true);
      } else {
        // 권한을 거부했으면 토글을 OFF로 유지하고 안내 메시지를 표시한다.
        setIsAutoLaunchEnabled(false);
        ToastAndroid.show(
          "기능을 쓰려면 '다른 앱 위에 표시' 권한이 필요해요",
          ToastAndroid.LONG
        );
      }
    } else {
      // 일반 진입/복귀: 저장된 값과 실제 권한 상태를 비교해 불일치 수정
      const savedEnabled: boolean = await AutoLaunchModule.isEnabled();
      if (savedEnabled && !hasPermission) {
        // 활성화되어 있지만 권한이 없음 → 강제 비활성화
        await AutoLaunchModule.setEnabled(false);
        setIsAutoLaunchEnabled(false);
        ToastAndroid.show(
          "'다른 앱 위에 표시' 권한이 해제되어 자동 실행이 꺼졌어요",
          ToastAndroid.LONG
        );
      } else {
        setIsAutoLaunchEnabled(savedEnabled);
      }
    }
  }, []);

  // ① 화면이 포커스를 받을 때마다 체크 (네비게이션 진입 & 시스템 설정 복귀 포함)
  useFocusEffect(
    useCallback(() => {
      syncPermissionState(false);
    }, [syncPermissionState])
  );

  // ② 앱 자체가 포그라운드로 돌아올 때 체크 (pendingPermissionCheck 케이스 포함)
  useEffect(() => {
    if (Platform.OS !== "android" || !AutoLaunchModule) return;

    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState !== "active") return;

      // 권한 확인 대기 중이었을 때만 처리한다.
      if (pendingPermissionCheck.current) {
        pendingPermissionCheck.current = false;
        await syncPermissionState(true);
      }
      // 일반 복귀는 useFocusEffect가 처리하므로 여기서는 pending 케이스만 담당
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [syncPermissionState]);

  // ── toggleAutoLaunch ──────────────────────────────────────
  // 잠금 해제 시 자동 실행 토글 핸들러 (Android 전용).
  // ON으로 전환할 때 오버레이 권한이 없으면 설정 화면으로 이동시킨다.
  const toggleAutoLaunch = async () => {
    if (Platform.OS !== "android" || !AutoLaunchModule) return;

    const newValue = !isAutoLaunchEnabled;

    if (newValue) {
      // ON으로 켜려는 경우 → 권한 먼저 확인
      const hasPermission: boolean = await AutoLaunchModule.hasOverlayPermission();
      if (!hasPermission) {
        // 권한 없음 → 설정 화면으로 이동, 복귀 후 체크 대기
        pendingPermissionCheck.current = true;
        await AutoLaunchModule.openOverlaySettings();
        return; // 토글 상태 변경 없이 종료
      }
    }

    try {
      await AutoLaunchModule.setEnabled(newValue);
      setIsAutoLaunchEnabled(newValue);
    } catch (e) {
      console.error("Failed to toggle auto launch", e);
    }
  };

  // ── handleRemoveAds ───────────────────────────────────────
  // 광고 제거 구매 처리 핸들러.
  // 이미 광고 제거가 활성화된 경우 안내 메시지를 표시하고 종료.
  // 그렇지 않으면 결제 확인 다이얼로그를 표시한다.
  // (실제 IAP 연동 전까지는 Mock으로 처리)
  const handleRemoveAds = () => {
    if (isAdFree) {
      Toast.show({ type: 'info', text1: '알림', text2: '이미 광고 제거 기능이 활성화되어 있습니다.' });
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
            Toast.show({ type: 'success', text1: '완료', text2: '광고 제거 기능이 활성화되었습니다.' });
          }
        }
      ]
    );
  };

  // 외부 URL을 기기 브라우저로 열기
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // 법적 화면(개인정보 처리방침 / 서비스 이용약관)으로 이동
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

          {/* ── 알림 섹션 ──────────────────────────────────── */}
          <Box marginBottom="lg">
            <Text
              fontSize={14}
              fontWeight="600"
              color={"$foreground"}
              marginBottom="s"
              marginLeft="s"
              style={{ opacity: 0.6 }}
            >
              알림
            </Text>
            <Box
              bg={"$sidebarBackground"}
              borderRadius={"md"}
              overflow="hidden"
            >
              {/* 오늘의 명언 알림 토글 */}
              <SettingItem
                icon={"bell"}
                title="오늘의 명언 알림"
                handleClickItem={() => setNotificationEnabled(!isNotificationEnabled)}
                rightElement={
                  <Switch
                    value={isNotificationEnabled}
                    onValueChange={(v) => setNotificationEnabled(v)}
                    trackColor={{ false: "#767577", true: "#2185d0" }}
                    thumbColor={isNotificationEnabled ? "#ffffff" : "#f4f3f4"}
                  />
                }
              />
              {/* 알림이 활성화된 경우에만 시간 설정 UI 표시 */}
              {isNotificationEnabled && (
                <>
                  <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    px="md"
                    minHeight={56}
                  >
                    <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
                      <Text fontSize={14}>⏰</Text>
                      <Text fontSize={14}>알림 시간</Text>
                    </Box>
                    <Box flexDirection="row" alignItems="center" style={{ gap: 4 }}>
                      {/* ── 시간 조정 (‹ HH ›) ── */}
                      <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
                        {/* 시간 감소 버튼: 0 이하이면 23으로 순환 */}
                        <Box
                          bg="$background"
                          borderRadius="md"
                          px="s"
                          py="xs"
                          onTouchEnd={() => {
                            const next = hourInput <= 0 ? 23 : hourInput - 1;
                            setHourInput(next);
                            setTime(next, minuteInput);
                          }}
                        >
                          <Text fontSize={16}>‹</Text>
                        </Box>
                        {/* 현재 시간 표시 (2자리 zero-padding) */}
                        <Text fontSize={15} fontWeight="bold" style={{ minWidth: 24, textAlign: 'center' }}>
                          {String(hourInput).padStart(2, '0')}
                        </Text>
                        {/* 시간 증가 버튼: 23 초과이면 0으로 순환 */}
                        <Box
                          bg="$background"
                          borderRadius="md"
                          px="s"
                          py="xs"
                          onTouchEnd={() => {
                            const next = hourInput >= 23 ? 0 : hourInput + 1;
                            setHourInput(next);
                            setTime(next, minuteInput);
                          }}
                        >
                          <Text fontSize={16}>›</Text>
                        </Box>
                      </Box>
                      <Text fontSize={15} fontWeight="bold">:</Text>
                      {/* ── 분 조정 (‹ MM ›, 5분 단위) ── */}
                      <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
                        {/* 분 감소 버튼: 0 이하이면 55로 순환 (5분 단위) */}
                        <Box
                          bg="$background"
                          borderRadius="md"
                          px="s"
                          py="xs"
                          onTouchEnd={() => {
                            const next = minuteInput <= 0 ? 55 : minuteInput - 5;
                            setMinuteInput(next);
                            setTime(hourInput, next);
                          }}
                        >
                          <Text fontSize={16}>‹</Text>
                        </Box>
                        {/* 현재 분 표시 (2자리 zero-padding) */}
                        <Text fontSize={15} fontWeight="bold" style={{ minWidth: 24, textAlign: 'center' }}>
                          {String(minuteInput).padStart(2, '0')}
                        </Text>
                        {/* 분 증가 버튼: 55 초과이면 0으로 순환 (5분 단위) */}
                        <Box
                          bg="$background"
                          borderRadius="md"
                          px="s"
                          py="xs"
                          onTouchEnd={() => {
                            const next = minuteInput >= 55 ? 0 : minuteInput + 5;
                            setMinuteInput(next);
                            setTime(hourInput, next);
                          }}
                        >
                          <Text fontSize={16}>›</Text>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          {/* ── 서비스 섹션 ────────────────────────────────── */}
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
              {/* 나만의 명언 관리 화면으로 이동 */}
              <SettingItem
                icon={"edit-3"}
                title="나만의 명언 관리"
                handleClickItem={() => router.push("/MyQuotesScreen")}
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              {/* 잠금 해제 시 자동 실행 (Android 전용) */}
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
              {/* 자주 묻는 질문: 외부 블로그 링크로 이동 */}
              <SettingItem
                icon={"help-circle"}
                title="자주 묻는 질문"
                handleClickItem={() =>
                  openLink("https://workshop-code.tistory.com/107")
                }
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              {/* 광고 제거 인앱 결제 */}
              <SettingItem
                icon={"shopping-cart"}
                title="광고 제거"
                handleClickItem={handleRemoveAds}
                rightElement={
                  isAdFree ? (
                    // 이미 구매한 경우 '활성화됨' 표시
                    <Text fontSize={14} color={"$primary"} fontWeight="bold">
                      활성화됨
                    </Text>
                  ) : (
                    // 미구매 시 가격 표시
                    <Text fontSize={14} style={{ opacity: 0.6 }}>
                      ₩990
                    </Text>
                  )
                }
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              {/* 스토어 리뷰 작성 */}
              <SettingItem
                icon={"star"}
                title="응원의 리뷰 쓰기"
                handleClickItem={() => console.log("click")}
              />
            </Box>
          </Box>

          {/* ── 앱 정보 섹션 ───────────────────────────────── */}
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
              {/* 개인정보 처리방침 화면으로 이동 */}
              <SettingItem
                icon={"shield"}
                title="개인정보 처리방침"
                handleClickItem={() => navigateToLegal("PrivacyScreen")}
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              {/* 서비스 이용약관 화면으로 이동 */}
              <SettingItem
                icon={"file-text"}
                title="서비스 이용약관"
                handleClickItem={() => navigateToLegal("TermsScreen")}
              />
              <Box height={1} bg={"$background"} marginHorizontal="md" style={{ opacity: 0.1 }} />
              {/* 현재 앱 버전 표시 (버튼 비활성) */}
              <SettingItem
                icon={"info"}
                title="버전 정보"
                handleClickItem={() => { }}
                rightElement={
                  <Text color={"$sidebarForeground"} style={{ opacity: 0.6 }}>
                    {appVersion}
                  </Text>
                }
              />
            </Box>
          </Box>

          {/* 저작권 표기 */}
          <Box paddingVertical="xl" alignItems="center">
            <Text fontSize={12} color={"$foreground"} style={{ opacity: 0.4 }}>
              © 2026 Self-Fire. All rights reserved.
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// _layout.tsx
// 앱 전체의 루트 레이아웃을 정의하는 파일.
// - AdMob 초기화
// - 포그라운드 알림 핸들러 설정
// - 구글 폰트 로드
// - 앱 상태(백그라운드 ↔ 포그라운드) 감지 및 화면 이동
// - SafeAreaProvider / ThemeProvider 등 글로벌 래퍼 제공
// ─────────────────────────────────────────────────────────────

import StatusBar from "@/components/status-bar";
import { useThemeStore } from "@/store/theme";
import { ThemeProvider } from "@shopify/restyle";
import { router, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";
import * as Notifications from "expo-notifications";

// ── AdMob 초기화 ──────────────────────────────────────────────
// 앱 시작 시 광고 SDK를 설정하고 초기화한다.
// 개발 환경(__DEV__)에서는 에뮬레이터를 테스트 기기로 등록한다.
mobileAds()
  .setRequestConfiguration({
    testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
  })
  .then(() => {
    return mobileAds().initialize();
  })
  .then((adapterStatuses) => {
    console.log('AdMob initialization complete!');
  });

// ── 포그라운드 알림 핸들러 ────────────────────────────────────
// 앱이 실행 중(포그라운드)일 때 알림을 받으면 배너로 표시한다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // 알림 표시
    shouldPlaySound: true,   // 소리 재생
    shouldSetBadge: false,   // 앱 아이콘 배지 미사용
    shouldShowBanner: true,  // 배너 표시
    shouldShowList: true,    // 알림 목록에 추가
  }),
});

// ── 구글 폰트 임포트 ──────────────────────────────────────────
// 앱에서 사용하는 한국어 폰트들을 expo-google-fonts로 불러온다.
import { useFonts, NotoSansKR_400Regular, NotoSansKR_700Bold, NotoSansKR_900Black } from "@expo-google-fonts/noto-sans-kr";
import { NanumMyeongjo_400Regular, NanumMyeongjo_700Bold, NanumMyeongjo_800ExtraBold } from "@expo-google-fonts/nanum-myeongjo";
import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Jua_400Regular } from "@expo-google-fonts/jua";
import { NanumPenScript_400Regular } from "@expo-google-fonts/nanum-pen-script";

import Toast from 'react-native-toast-message';
import { View, Text, Platform } from 'react-native';
import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

// ── SimpleToast 컴포넌트 ──────────────────────────────────────
// react-native-toast-message의 커스텀 토스트 UI.
// 기본 제공 스타일 대신 다크 필 배경의 심플한 알약 형태로 표시한다.
const SimpleToast = ({ text1, text2 }: any) => {
  // text2가 있으면 우선 사용, 없으면 text1을 메시지로 표시
  const message = text2 || text1;
  if (!message) return null;
  return (
    <View style={{
      backgroundColor: '#333333',
      borderRadius: 100,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
};

// ── 토스트 타입별 컴포넌트 맵핑 ──────────────────────────────
// success / error / info 모두 동일한 SimpleToast를 사용한다.
const toastConfig = {
  success: SimpleToast,
  error: SimpleToast,
  info: SimpleToast,
};

// ── RootLayout (기본 내보내기) ────────────────────────────────
// 앱의 최상위 레이아웃 컴포넌트.
export default function RootLayout() {
  // 현재 선택된 테마(라이트 / 다크 등)를 전역 스토어에서 가져온다.
  const { currentTheme } = useThemeStore();

  // 앱 상태(active / background / inactive)를 추적하기 위한 ref
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // 사용할 폰트 목록을 로드한다. 로드 완료 전까지 화면을 렌더링하지 않는다.
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
    NotoSansKR_900Black,
    NanumMyeongjo_400Regular,
    NanumMyeongjo_700Bold,
    NanumMyeongjo_800ExtraBold,
    GowunDodum_400Regular,
    Jua_400Regular,
    NanumPenScript_400Regular,
  });

  // ── 앱 상태 변화 감지 ──────────────────────────────────────
  // 백그라운드 → 포그라운드 전환 시 메인 화면 (/(navi))으로 이동한다.
  // 이를 통해 다른 앱에서 돌아올 때 항상 명언 화면이 표시된다.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // 백그라운드 → 포그라운드로 전환될 때 메인으로 이동
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        router.replace("/(navi)");
      }
      appState.current = nextAppState;
    });

    // 앱 시작 시 강제 업데이트 체크
    try {
      const inAppUpdates = new SpInAppUpdates(false);
      inAppUpdates.checkNeedsUpdate().then((result) => {
        if (result.shouldUpdate) {
          let updateOptions = {};
          if (Platform.OS === 'android') {
            updateOptions = {
              updateType: IAUUpdateKind.IMMEDIATE,
            };
          }
          inAppUpdates.startUpdate(updateOptions);
        }
      }).catch(err => console.log('Update check failed:', err));
    } catch (e) {
      console.log('InAppUpdates Initialization failed:', e);
    }

    // 컴포넌트 언마운트 시 이벤트 구독 해제
    return () => subscription.remove();
  }, []);

  // 폰트 로딩이 완료되지 않았으면 아무것도 렌더링하지 않는다.
  if (!fontsLoaded) {
    return null;
  }

  return (
    // SafeAreaProvider: 노치/홈 바 등 안전 영역을 계산해 자식에게 제공
    <SafeAreaProvider>
      {/* ThemeProvider: 전체 앱에 선택된 테마(색상/간격 토큰 등)를 주입 */}
      <ThemeProvider theme={currentTheme}>
        <StatusBar></StatusBar>

        {/* Stack: 화면 간 스택 네비게이션 정의 */}
        <Stack initialRouteName="(navi)">
          {/* 메인 탭 네비게이션 그룹 */}
          <Stack.Screen
            name="(navi)"
            options={{
              headerShown: false,
            }}
          />
          {/* 설정 화면 */}
          <Stack.Screen
            name="SettingScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* 개인정보 처리방침 화면 */}
          <Stack.Screen
            name="PrivacyScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* 서비스 이용약관 화면 */}
          <Stack.Screen
            name="TermsScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* 내가 쓴 명언 목록 화면 */}
          <Stack.Screen
            name="MyQuotesScreen"
            options={{
              headerShown: false,
            }}
          />
          {/* 명언 추가/수정 모달 화면 */}
          <Stack.Screen
            name="AddQuoteScreen"
            options={{
              headerShown: false,
              presentation: "modal", // iOS: 아래서 올라오는 모달 형태
            }}
          />
        </Stack>

        {/* 전역 토스트 알림 컴포넌트 (화면 하단에 배치) */}
        <Toast position="bottom" bottomOffset={60} config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

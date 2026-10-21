// ─────────────────────────────────────────────────────────────
// bootstrap.ts
// 앱이 켜질 때 한 번 하는 일. app/_layout.tsx가 화면을 그리기 전에 부른다.
//   - 스플래시 유지 (폰트를 불러올 때까지)
//   - Firebase Analytics·Crashlytics 초기화
//   - AdMob 초기화
//   - 포그라운드 알림 핸들러 설정
// 강제 업데이트 확인(checkForcedUpdate)은 첫 화면이 뜬 뒤에 부른다.
// ─────────────────────────────────────────────────────────────

import { initAnalytics } from "@/utils/analytics";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from "sp-react-native-in-app-updates";

let bootstrapped = false;

export const bootstrapApp = () => {
  if (bootstrapped) return;
  bootstrapped = true;

  // 폰트를 불러올 때까지 스플래시를 유지한다.
  SplashScreen.preventAutoHideAsync().catch(() => {});

  // ── 분석·크래시 리포트 초기화 ─────────────────────────────────
  initAnalytics();

  // ── AdMob 초기화 ──────────────────────────────────────────────
  // 개발 환경에서는 에뮬레이터를 테스트 기기로 등록한다.
  mobileAds()
    .setRequestConfiguration({ testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [] })
    .then(() => mobileAds().initialize());

  // ── 포그라운드 알림 핸들러 ────────────────────────────────────
  // 앱 실행 중에 알림을 받아도 배너/소리로 표시한다. (앱 아이콘 배지는 사용하지 않음)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

// ── 강제 업데이트 ─────────────────────────────────────────────
// 스토어에 새 버전이 있으면 바로 업데이트를 진행한다. (Android: 즉시 업데이트)
export const checkForcedUpdate = () => {
  try {
    const inAppUpdates = new SpInAppUpdates(false);
    inAppUpdates
      .checkNeedsUpdate()
      .then((result) => {
        if (!result.shouldUpdate) return;
        const options: StartUpdateOptions =
          Platform.OS === "android" ? { updateType: IAUUpdateKind.IMMEDIATE } : {};
        inAppUpdates.startUpdate(options);
      })
      .catch((err) => console.log("Update check failed:", err));
  } catch (e) {
    console.log("InAppUpdates Initialization failed:", e);
  }
};

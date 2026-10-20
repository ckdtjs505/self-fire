// ─────────────────────────────────────────────────────────────
// analytics.ts
// Firebase Analytics / Crashlytics 래퍼.
// - 개발 빌드(__DEV__)에서는 수집을 끈다.
// - 처리되지 않은 JS 에러는 Crashlytics 모듈이 자동으로 기록한다.
// - 분석 호출이 실패해도 앱 동작에는 영향을 주지 않도록 모든 호출을 감싼다.
// - D1/D7 리텐션은 Firebase가 자동 수집하는 first_open / user_engagement로 측정된다.
//   (콘솔 > Analytics > 리텐션). 아래 커스텀 이벤트는 '무엇을 하는 사용자가 남는지' 분석용.
// ─────────────────────────────────────────────────────────────

import {
  getAnalytics,
  logEvent,
  logScreenView,
  setAnalyticsCollectionEnabled,
  setUserProperty,
} from "@react-native-firebase/analytics";
import {
  getCrashlytics,
  recordError,
  setCrashlyticsCollectionEnabled,
} from "@react-native-firebase/crashlytics";

const COLLECTION_ENABLED = !__DEV__;

const safely = (fn: () => unknown) => {
  try {
    const result = fn();
    if (result instanceof Promise) result.catch(() => {});
  } catch {
    // 분석 실패는 무시한다.
  }
};

// 앱 시작 시 한 번 호출한다.
export const initAnalytics = () => {
  safely(() => setAnalyticsCollectionEnabled(getAnalytics(), COLLECTION_ENABLED));
  safely(() => setCrashlyticsCollectionEnabled(getCrashlytics(), COLLECTION_ENABLED));
};

// ── 이벤트 ───────────────────────────────────────────────────
// 이벤트 이름은 Firebase 규칙(영문 소문자·숫자·밑줄, 40자 이하)을 따른다.
type EventParams = Record<string, string | number | boolean>;

export type AnalyticsEvent =
  | "ignite_complete" // 하루 첫 점화 완료
  | "streak_freeze_used" // 불씨 지키기로 빠진 하루를 지킴
  | "streak_milestone" // 7/30/100일 마일스톤 도달 (보상 해금)
  | "reminder_offer" // 점화 후 알림 받기 제안에 응답 (accepted, granted, hour)
  | "interests_set" // 관심 주제 저장 (source: onboarding | settings, count, topics)
  | "quote_share" // 명언 공유
  | "quote_add" // 내 명언 추가
  | "quote_edit"; // 내 명언 수정

export const trackEvent = (name: AnalyticsEvent, params?: EventParams) => {
  safely(() => logEvent(getAnalytics(), name as string, params));
};

export const trackScreen = (screenName: string) => {
  safely(() => logScreenView(getAnalytics(), { screen_name: screenName, screen_class: screenName }));
};

export const setUserProp = (name: string, value: string | null) => {
  safely(() => setUserProperty(getAnalytics(), name, value));
};

// 직접 잡은 에러를 non-fatal로 기록한다.
export const reportError = (error: unknown, context?: string) => {
  const err = error instanceof Error ? error : new Error(String(error));
  safely(() => recordError(getCrashlytics(), err, context));
};

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
  | "deed_save" // 오늘 이 문장대로 할 일 저장 (edit, change_quote, length)
  | "deed_complete" // 오늘 할 일을 해내고 완료를 누름 (이어서 점화)
  | "today_quote_pick" // 오늘의 문장을 정함 (change: 이미 고른 문장을 바꿨는지)
  | "streak_freeze_used" // 불씨 지키기로 빠진 하루를 지킴
  | "streak_milestone" // 3/7/14/30/50/100일 마일스톤 도달 (7/30/100일은 보상 해금)
  | "reminder_offer" // 점화 후 알림 받기 제안에 응답 (accepted, granted, hour)
  | "interests_set" // 관심 주제 저장 (source: onboarding | settings, count, topics)
  | "quote_share" // 명언 공유
  | "deed_share" // 오늘 할 일 공유 (method)
  | "quote_add" // 내 명언 추가
  | "quote_edit" // 내 명언 수정
  | "favorite_add" // 저장한 문장에 저장
  | "favorite_remove" // 저장한 문장에서 해제
  | "favorite_undo" // 해제 직후 되돌리기
  | "favorites_search" // 저장한 문장 목록에서 검색을 시작함 (화면을 열 때마다 한 번)
  | "favorite_open" // 저장한 문장 목록에서 명언을 눌러 홈에서 엶
  | "notification_open" // 알림을 눌러 앱을 엶 (type: daily | streak)
  | "onboarding_skip" // 첫 실행 주제 고르기를 건너뜀
  | "widget_prompt_shown" // 점화 완료 시트에서 위젯 추가 제안 (streak)
  | "widget_prompt_dismiss" // 위젯 추가 제안을 닫음 (streak)
  | "widget_pin_request" // 위젯 추가 창 요청 (widget, source, accepted)
  | "widget_added" // 홈 화면에 위젯이 놓임 (widget)
  | "review_prompt_requested" // 7일 이상 이어 간 날 인앱 리뷰 창을 요청함 (streak)

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

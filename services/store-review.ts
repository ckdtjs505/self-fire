// ─────────────────────────────────────────────────────────────
// services/store-review.ts
// 인앱 리뷰 요청 (Google Play In-App Review / iOS SKStoreReviewController).
//   - 불씨를 7일 이상 이어 간 날, 점화 완료 시트를 '확인'으로 닫을 때 평생 한 번 요청한다.
//     (습관이 생겨 만족도가 높은 때. 알림·위젯 제안이 뜬 날은 겹치지 않게 건너뛰고 다음 날 다시 본다)
//   - 실제로 창을 띄울지는 스토어가 정한다. 할당량 때문에 아무것도 뜨지 않을 수 있다.
//   - 설정의 '응원의 리뷰 쓰기'(스토어 페이지 열기)는 그대로 둔다.
// ─────────────────────────────────────────────────────────────

import { trackEvent } from "@/utils/analytics";
import { toDateString } from "@/utils/date";
import { appStorage } from "@/utils/storage";
import * as StoreReview from "expo-store-review";

// 리뷰를 요청한 날짜 ("YYYY-MM-DD"). 값이 있으면 다시 요청하지 않는다.
export const REVIEW_REQUESTED_KEY = "review_requested";

// 리뷰를 요청하는 최소 연속 일수 (첫 보상 마일스톤)
export const REVIEW_MIN_STREAK = 7;

export const shouldRequestReview = ({ streak, requested }: { streak: number; requested: boolean }) =>
  streak >= REVIEW_MIN_STREAK && !requested;

// 조건이 맞으면 리뷰 창을 요청한다. 요청했으면 true.
export const maybeRequestReview = async (streak: number): Promise<boolean> => {
  try {
    const requested = (await appStorage.getItem(REVIEW_REQUESTED_KEY)) !== null;
    if (!shouldRequestReview({ streak, requested })) return false;
    if (!(await StoreReview.isAvailableAsync())) return false;

    await appStorage.setItem(REVIEW_REQUESTED_KEY, toDateString());
    await StoreReview.requestReview();
    trackEvent("review_prompt_requested", { streak });
    return true;
  } catch {
    // 리뷰 요청 실패는 앱 동작에 영향을 주지 않는다.
    return false;
  }
};

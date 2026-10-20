// ─────────────────────────────────────────────────────────────
// haptics.ts
// 손끝 진동. 지원하지 않는 환경(웹 등)에서는 조용히 넘어간다.
// ─────────────────────────────────────────────────────────────

import * as Haptics from "expo-haptics";

const safely = (run: () => Promise<void>) => {
  try {
    run().catch(() => {});
  } catch {
    // 진동을 못 해도 앱 동작에는 영향이 없다.
  }
};

// 가벼운 톡 (버튼·토글)
export const tapHaptic = () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

// 점점 세지는 진동 한 번 (강도: 0 → 1)
export const pulseHaptic = (intensity: number) =>
  safely(() =>
    Haptics.impactAsync(
      intensity < 0.4
        ? Haptics.ImpactFeedbackStyle.Light
        : intensity < 0.8
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy,
    ),
  );

// 완료 (점화 성공 등)
export const successHaptic = () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { useStreakStore, whenStreakHydrated } from "@/store/streak";
import { setUserProp, trackEvent } from "@/utils/analytics";

const streakBucket = (streak: number) => {
  if (streak >= 30) return "30+";
  if (streak >= 7) return "7-29";
  if (streak >= 3) return "3-6";
  return String(streak);
};

/**
 * 앱을 열 때 스트릭이 아직 이어지는지 맞추는 훅. (스트릭 +1은 불씨 점화 때 — useDailyIgnite)
 * 어제를 빠뜨렸지만 불씨 지키기로 지켰으면 알려 준다.
 * 메인 화면에서 한 번만 호출.
 */
export const useStreak = () => {
  const { currentStreak, longestStreak } = useStreakStore();

  useEffect(() => {
    whenStreakHydrated().then(() => {
      const frozenDate = useStreakStore.getState().reconcile();
      if (!frozenDate) return;
      trackEvent("streak_freeze_used", { streak: useStreakStore.getState().currentStreak });
      Toast.show({
        type: "info",
        text1: "불씨 지키기",
        text2: "어제는 쉬었지만 불씨를 지켜 두었어요 🛡️ (주 1회)",
      });
    });
  }, []);

  // 리텐션을 스트릭 구간별로 나눠 보기 위한 사용자 속성
  useEffect(() => {
    setUserProp("streak_bucket", streakBucket(currentStreak));
  }, [currentStreak]);

  return { currentStreak, longestStreak };
};

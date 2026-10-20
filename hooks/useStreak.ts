import { useEffect } from "react";
import { useStreakStore } from "@/store/streak";
import { setUserProp } from "@/utils/analytics";

const streakBucket = (streak: number) => {
  if (streak >= 30) return "30+";
  if (streak >= 7) return "7-29";
  if (streak >= 3) return "3-6";
  return String(streak);
};

/**
 * 앱이 실행될 때마다 스트릭을 자동으로 업데이트하는 훅.
 * _layout.tsx 또는 메인 화면에서 한 번만 호출.
 */
export const useStreak = () => {
  const { checkAndUpdateStreak, currentStreak, longestStreak } = useStreakStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  // 리텐션을 스트릭 구간별로 나눠 보기 위한 사용자 속성
  useEffect(() => {
    setUserProp("streak_bucket", streakBucket(currentStreak));
  }, [currentStreak]);

  return { currentStreak, longestStreak };
};

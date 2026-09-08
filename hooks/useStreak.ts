import { useEffect } from "react";
import { useStreakStore } from "@/store/streak";

/**
 * 앱이 실행될 때마다 스트릭을 자동으로 업데이트하는 훅.
 * _layout.tsx 또는 메인 화면에서 한 번만 호출.
 */
export const useStreak = () => {
  const { checkAndUpdateStreak, currentStreak, longestStreak } = useStreakStore();

  useEffect(() => {
    checkAndUpdateStreak();
  }, []);

  return { currentStreak, longestStreak };
};

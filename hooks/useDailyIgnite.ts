import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStreakStore, whenStreakHydrated } from "@/store/streak";
import { trackEvent } from "@/utils/analytics";
import { toDateString } from "@/utils/date";

export const LAST_IGNITED_DATE_KEY = "last_ignited_date";

// 점화 결과: 점화 완료 시트(ignite-result-sheet.tsx)에 그대로 넘긴다.
export type IgniteResult = {
  streak: number;
  unlockedMilestone: number | null;
};

/**
 * 하루 1번, 그날 처음 앱을 열었을 때만 불씨(Hold to Ignite) 화면을 보여주기 위한 훅.
 * AsyncStorage에 오늘 날짜가 기록되어 있으면 이미 점화한 것으로 본다.
 * 점화하면 스트릭이 +1 되고, 그 결과(연속 일수·새로 해금된 마일스톤)를 돌려준다.
 */
export const useDailyIgnite = () => {
  // 초기값 true: 저장값을 읽는 동안 불씨 화면이 깜빡이는 것을 방지
  const [isIgnited, setIsIgnited] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(LAST_IGNITED_DATE_KEY).then((lastDate) => {
      setIsIgnited(lastDate === toDateString());
    });
  }, []);

  const markIgnited = async (): Promise<IgniteResult> => {
    await AsyncStorage.setItem(LAST_IGNITED_DATE_KEY, toDateString());
    await whenStreakHydrated();
    const unlockedMilestone = useStreakStore.getState().ignite();
    setIsIgnited(true);
    const streak = useStreakStore.getState().currentStreak;
    trackEvent("ignite_complete", { streak });
    if (unlockedMilestone) trackEvent("streak_milestone", { milestone: unlockedMilestone });

    return { streak, unlockedMilestone };
  };

  return { isIgnited, markIgnited };
};

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { getMilestoneRewardNames } from "@/data/streak-rewards";
import { useStreakStore, whenStreakHydrated } from "@/store/streak";
import { trackEvent } from "@/utils/analytics";
import { toDateString } from "@/utils/date";

export const LAST_IGNITED_DATE_KEY = "last_ignited_date";

/**
 * 하루 1번, 그날 처음 앱을 열었을 때만 불씨(Hold to Ignite) 화면을 보여주기 위한 훅.
 * AsyncStorage에 오늘 날짜가 기록되어 있으면 이미 점화한 것으로 본다.
 * 점화하면 스트릭이 +1 되고, 마일스톤에 닿으면 해금된 보상을 알려 준다.
 */
export const useDailyIgnite = () => {
  // 초기값 true: 저장값을 읽는 동안 불씨 화면이 깜빡이는 것을 방지
  const [isIgnited, setIsIgnited] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(LAST_IGNITED_DATE_KEY).then((lastDate) => {
      setIsIgnited(lastDate === toDateString());
    });
  }, []);

  const markIgnited = async () => {
    await AsyncStorage.setItem(LAST_IGNITED_DATE_KEY, toDateString());
    await whenStreakHydrated();
    const unlockedMilestone = useStreakStore.getState().ignite();
    setIsIgnited(true);
    trackEvent("ignite_complete", { streak: useStreakStore.getState().currentStreak });

    if (unlockedMilestone) {
      trackEvent("streak_milestone", { milestone: unlockedMilestone });
      Toast.show({
        type: "success",
        text2: `🔥 ${unlockedMilestone}일 연속 점화! 새 보상: ${getMilestoneRewardNames(unlockedMilestone)}`,
        visibilityTime: 5000,
      });
    }
  };

  return { isIgnited, markIgnited };
};

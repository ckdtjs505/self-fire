import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_SWIPED_KEY = "has_swiped_quote";

/**
 * 좌우로 넘기면 다음 명언이 나온다는 걸 아직 모르는 사용자에게만 힌트를 보여 주기 위한 훅.
 * 한 번이라도 넘기면 다시 보여 주지 않는다.
 */
export const useSwipeHint = () => {
  // 초기값 false: 저장값을 읽기 전에 힌트가 깜빡이지 않도록
  const [needsHint, setNeedsHint] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(HAS_SWIPED_KEY).then((value) => setNeedsHint(value === null));
  }, []);

  const markSwiped = () => {
    if (!needsHint) return;
    setNeedsHint(false);
    AsyncStorage.setItem(HAS_SWIPED_KEY, "true");
  };

  return { needsHint, markSwiped };
};

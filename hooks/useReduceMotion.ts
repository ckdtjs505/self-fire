import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * 기기 설정의 '동작 줄이기(모션 줄이기)'가 켜져 있으면 true.
 * 켜져 있으면 깜빡임·파티클·밀기 힌트 같은 장식 애니메이션을 끄고 단순한 페이드만 쓴다.
 */
export const useReduceMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  return reduceMotion;
};

// ─────────────────────────────────────────────────────────────
// quote-swiper.tsx
// 명언 카드 한 장을 보여주고, 좌우 스와이프로 이전/다음 명언으로 넘긴다.
//   - 드래그 중: 카드가 손가락을 살짝 따라오며 옅어짐
//   - 임계값 이상 스와이프: 새 카드가 반대편에서 슬라이드 + 페이드 인
//   - 임계값 미달: 스프링으로 원위치
//   - 아직 한 번도 넘겨 보지 않은 사용자에게는 카드를 왼쪽으로 살짝 밀었다 놓으며 넘길 수 있다고 알려 준다
//   - 기기의 '동작 줄이기'가 켜져 있으면 슬라이드·밀기 힌트 없이 페이드로만 바꾼다
// Gesture Handler의 Pan 제스처 + Reanimated라 Drawer 제스처와 충돌하지 않고 UI 스레드에서 움직인다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import QuoteItem from "@/components/quote-items";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { Quote } from "@/models";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// 다음/이전으로 넘어가기 위한 최소 이동 거리(px)와 속도(px/s)
const SWIPE_VELOCITY_THRESHOLD = 500;
// 카드 아래 넘기기 힌트 자리의 높이
const HINT_SLOT_HEIGHT = 40;

// 예전 Animated.spring(tension/friction)과 같은 느낌이 나도록 맞춘 스프링 값
const ENTER_SPRING = { stiffness: 339, damping: 37, mass: 1 }; // tension 70, friction 12
const BACK_SPRING = { stiffness: 375, damping: 31, mass: 1 }; // tension 80, friction 10
const NUDGE_SPRING = { stiffness: 303, damping: 22, mass: 1 }; // tension 60, friction 7

type Props = {
  quote?: Quote;
  isCustom: boolean;
  // 오늘의 문장으로 정한 명언이면 true
  isTodaysQuote?: boolean;
  canGoPrev: boolean;
  // 넘길 다음 명언이 없으면 (예: 내 명언의 마지막 명언) false
  canGoNext: boolean;
  onNext: () => void;
  onPrev: () => void;
  // 아직 한 번도 넘겨 보지 않았으면 true (넘기기 힌트)
  showSwipeHint?: boolean;
  // 카드 바로 아래에 붙여 함께 넘어가는 자리 (홈: 이 문장대로 한 일 한 줄)
  cardFooter?: React.ReactNode;
};

// 넘기기 힌트: 카드를 왼쪽으로 이만큼 밀었다가 되돌린다
const HINT_NUDGE_X = -42;

const QuoteSwiper: React.FC<Props> = ({
  quote,
  isCustom,
  isTodaysQuote = false,
  canGoPrev,
  canGoNext,
  onNext,
  onPrev,
  showSwipeHint = false,
  cardFooter,
}) => {
  // 회전·창 크기 변경에 맞춰 스와이프 기준을 다시 계산한다.
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.2;
  const reduceMotion = useReduceMotion();
  const ENTER_OFFSET = reduceMotion ? 0 : SCREEN_WIDTH * 0.25;
  const slideX = useSharedValue(0);
  const fade = useSharedValue(1);

  // 넘기기 힌트: 잠시 뒤 카드를 왼쪽으로 두 번 살짝 밀었다 놓는다. (손가락이 닿으면 멈춤)
  const hintActive = showSwipeHint && canGoNext;
  useEffect(() => {
    if (!hintActive || reduceMotion) return;
    const nudge = () =>
      withSequence(withTiming(HINT_NUDGE_X, { duration: 380 }), withSpring(0, NUDGE_SPRING));
    slideX.value = withDelay(1500, withSequence(nudge(), withDelay(700, nudge())));
    // 첫 스와이프로 힌트가 꺼질 때는 이미 새 카드의 진입 스프링이 돌고 있다.
    // cancelAnimation으로 멈추면 카드가 옆으로 밀린 채 굳으므로, 남은 힌트만 지우고 가운데로 되돌린다.
    return () => {
      slideX.value = withSpring(0, ENTER_SPRING);
    };
  }, [hintActive, reduceMotion, slideX]);

  // 새 카드를 fromX 위치에서 가운데로 슬라이드 + 페이드 인
  const playEnter = (fromX: number) => {
    "worklet";
    slideX.value = fromX;
    fade.value = 0;
    slideX.value = withSpring(0, ENTER_SPRING);
    fade.value = withTiming(1, { duration: 230 });
  };

  // 현재 카드를 원위치로 되돌린다
  const springBack = () => {
    "worklet";
    slideX.value = withSpring(0, BACK_SPRING);
    fade.value = withTiming(1, { duration: 150 });
  };

  // 드래그 중 계산은 UI 스레드에서 하고, 명언 바꾸기만 JS로 넘긴다.
  // 새 값을 대입하면 진행 중인 애니메이션(넘기기 힌트 포함)은 바로 멈춘다.
  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      slideX.value = e.translationX * 0.45;
      fade.value = 1 - Math.min(Math.abs(e.translationX) / (SCREEN_WIDTH * 0.9), 0.25);
    })
    .onEnd((e) => {
      const dx = e.translationX;
      const vx = e.velocityX;
      const isSwipeLeft = dx < -SWIPE_DISTANCE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD;
      const isSwipeRight = dx > SWIPE_DISTANCE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD;

      if (isSwipeLeft && canGoNext) {
        runOnJS(onNext)();
        playEnter(ENTER_OFFSET);
      } else if (isSwipeRight && canGoPrev) {
        runOnJS(onPrev)();
        playEnter(-ENTER_OFFSET);
      } else {
        springBack();
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: slideX.value }, { scale: interpolate(fade.value, [0, 1], [0.94, 1]) }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ flex: 1, width: "100%" }}>
        {/* 아주 긴 명언이 넘쳐도 위쪽 카테고리 칩을 덮지 않도록 이 영역 밖은 잘라 낸다. */}
        <Box flex={1} width="100%" justifyContent="center" alignItems="center" overflow="hidden">
          {quote && (
            <Animated.View style={[{ flex: 1, width: "100%" }, cardStyle]}>
              <QuoteItem key={quote.id} {...quote} isCustom={isCustom} isTodaysQuote={isTodaysQuote} footer={cardFooter} />
            </Animated.View>
          )}
        </Box>

        {/* 아직 한 번도 넘겨 보지 않았으면 넘기기 힌트. 힌트가 사라져도 카드가 움직이지 않도록 자리를 비워 둔다. */}
        <Box height={HINT_SLOT_HEIGHT} alignItems="center" justifyContent="center">
          {hintActive && (
            <Text variant="caption">
              ← 넘겨서 다음 명언 보기
            </Text>
          )}
        </Box>
      </Animated.View>
    </GestureDetector>
  );
};

export default QuoteSwiper;

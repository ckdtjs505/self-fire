// ─────────────────────────────────────────────────────────────
// quote-swiper.tsx
// 명언 카드 한 장을 보여주고, 좌우 스와이프로 이전/다음 명언으로 넘긴다.
//   - 드래그 중: 카드가 손가락을 살짝 따라오며 옅어짐
//   - 임계값 이상 스와이프: 새 카드가 반대편에서 슬라이드 + 페이드 인
//   - 임계값 미달: 스프링으로 원위치
//   - 이전에 본 명언을 보는 중이면 카드 아래에 '새 명언으로' 버튼을 띄워 마지막 위치로 바로 돌아간다
//   - 아직 한 번도 넘겨 보지 않은 사용자에게는 카드를 왼쪽으로 살짝 밀었다 놓으며 넘길 수 있다고 알려 준다
//   - 기기의 '동작 줄이기'가 켜져 있으면 슬라이드·밀기 힌트 없이 페이드로만 바꾼다
// PanGestureHandler 기반이라 Drawer 제스처와 충돌하지 않는다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import FeatherIcon from "@/components/icon";
import QuoteItem from "@/components/quote-items";
import { useReduceMotion } from "@/hooks/useReduceMotion";
import { Quote } from "@/models";
import { useEffect, useRef } from "react";
import { Animated, useWindowDimensions } from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  Pressable,
  State,
  type PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

// 다음/이전으로 넘어가기 위한 최소 이동 거리(px)와 속도(px/s)
const SWIPE_VELOCITY_THRESHOLD = 500;
// 카드 아래 '새 명언으로' 버튼 자리의 높이
const REVISIT_SLOT_HEIGHT = 58;

type Props = {
  quote?: Quote;
  isCustom: boolean;
  // 이미 지나온 명언을 다시 보고 있으면 true
  isRevisit: boolean;
  canGoPrev: boolean;
  // 넘길 다음 명언이 없으면 (예: 내 명언의 마지막 명언) false
  canGoNext: boolean;
  onNext: () => void;
  onPrev: () => void;
  // 가장 멀리 본 명언으로 돌아간다
  onJumpToLatest: () => void;
  // 아직 한 번도 넘겨 보지 않았으면 true (넘기기 힌트)
  showSwipeHint?: boolean;
};

// 넘기기 힌트: 카드를 왼쪽으로 이만큼 밀었다가 되돌린다
const HINT_NUDGE_X = -42;

const QuoteSwiper: React.FC<Props> = ({
  quote,
  isCustom,
  isRevisit,
  canGoPrev,
  canGoNext,
  onNext,
  onPrev,
  onJumpToLatest,
  showSwipeHint = false,
}) => {
  // 회전·창 크기 변경에 맞춰 스와이프 기준을 다시 계산한다.
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.2;
  const reduceMotion = useReduceMotion();
  const ENTER_OFFSET = reduceMotion ? 0 : SCREEN_WIDTH * 0.25;
  const slideX = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  // 넘기기 힌트: 잠시 뒤 카드를 왼쪽으로 두 번 살짝 밀었다 놓는다. (손가락이 닿으면 멈춤)
  const hintActive = showSwipeHint && canGoNext;
  const hintAnim = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (!hintActive || reduceMotion) return;
    const nudge = Animated.sequence([
      Animated.timing(slideX, { toValue: HINT_NUDGE_X, duration: 380, useNativeDriver: true }),
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true, tension: 60, friction: 7 }),
    ]);
    const hint = Animated.sequence([Animated.delay(1500), nudge, Animated.delay(700), nudge]);
    hintAnim.current = hint;
    hint.start();
    return () => hint.stop();
  }, [hintActive, reduceMotion, slideX]);

  // 새 카드를 fromX 위치에서 가운데로 슬라이드 + 페이드 인
  const playEnter = (fromX: number) => {
    slideX.setValue(fromX);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }),
      Animated.timing(fade, { toValue: 1, duration: 230, useNativeDriver: true }),
    ]).start();
  };

  // 현재 카드를 원위치로 되돌린다
  const springBack = () => {
    Animated.spring(slideX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    hintAnim.current?.stop();
    const dx = event.nativeEvent.translationX;
    slideX.setValue(dx * 0.45);
    fade.setValue(1 - Math.min(Math.abs(dx) / (SCREEN_WIDTH * 0.9), 0.25));
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { state, translationX: dx, velocityX: vx } = event.nativeEvent;
    if (state !== State.END && state !== State.CANCELLED) return;

    // 진행 중인 애니메이션이 있으면 즉시 멈추고 새 전환을 시작한다.
    slideX.stopAnimation();
    fade.stopAnimation();

    const isSwipeLeft = dx < -SWIPE_DISTANCE_THRESHOLD || vx < -SWIPE_VELOCITY_THRESHOLD;
    const isSwipeRight = dx > SWIPE_DISTANCE_THRESHOLD || vx > SWIPE_VELOCITY_THRESHOLD;

    if (isSwipeLeft && canGoNext) {
      onNext();
      playEnter(ENTER_OFFSET);
    } else if (isSwipeRight && canGoPrev) {
      onPrev();
      playEnter(-ENTER_OFFSET);
    } else {
      springBack();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-12, 12]}
      failOffsetY={[-8, 8]}
    >
      <Animated.View style={{ flex: 1, width: "100%" }}>
        <Box flex={1} width="100%" justifyContent="center" alignItems="center">
          {quote && (
            <Animated.View
              style={{
                flex: 1,
                width: "100%",
                opacity: fade,
                transform: [
                  { translateX: slideX },
                  { scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                ],
              }}
            >
              <QuoteItem key={quote.id} {...quote} isCustom={isCustom} />
            </Animated.View>
          )}
        </Box>

        {/* 이전에 본 명언을 보는 중이면 '새 명언으로' 버튼을 띄운다.
            버튼이 생겨도 카드가 움직이지 않도록 자리를 항상 비워 둔다. */}
        <Box height={REVISIT_SLOT_HEIGHT} alignItems="center" justifyContent="center">
          {!isRevisit && hintActive && (
            <Text variant="caption">
              ← 넘겨서 다음 명언 보기
            </Text>
          )}
          {isRevisit && (
            // 부모 PanGestureHandler가 탭을 가로채지 않도록 감싼다 (quote-bar.tsx 참고)
            <NativeViewGestureHandler>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="새 명언으로"
                accessibilityHint="가장 최근에 본 명언으로 돌아갑니다"
                onPress={() => {
                  onJumpToLatest();
                  playEnter(ENTER_OFFSET);
                }}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  bg="$primary"
                  height={38}
                  borderRadius="pill"
                  style={{ gap: 4, paddingLeft: 16, paddingRight: 12 }}
                >
                  <Text variant="label" color="$onPrimary">
                    새 명언으로
                  </Text>
                  <FeatherIcon name="chevron-right" size={15} color="$onPrimary" />
                </Box>
              </Pressable>
            </NativeViewGestureHandler>
          )}
        </Box>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default QuoteSwiper;

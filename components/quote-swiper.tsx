// ─────────────────────────────────────────────────────────────
// quote-swiper.tsx
// 명언 카드 한 장을 보여주고, 좌우 스와이프로 이전/다음 명언으로 넘긴다.
//   - 드래그 중: 카드가 손가락을 살짝 따라오며 옅어짐
//   - 임계값 이상 스와이프: 새 카드가 반대편에서 슬라이드 + 페이드 인
//   - 임계값 미달: 스프링으로 원위치
//   - 이전에 본 명언을 보는 중이면 아래에 '새 명언으로' 버튼을 띄워 마지막 위치로 바로 돌아간다
// PanGestureHandler 기반이라 Drawer 제스처와 충돌하지 않는다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import FeatherIcon from "@/components/icon";
import QuoteItem from "@/components/quote-items";
import { Quote } from "@/models";
import { useRef } from "react";
import { Animated, Dimensions } from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  Pressable,
  State,
  type PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 다음/이전으로 넘어가기 위한 최소 이동 거리(px)와 속도(px/s)
const SWIPE_DISTANCE_THRESHOLD = SCREEN_WIDTH * 0.2;
const SWIPE_VELOCITY_THRESHOLD = 500;
// 새 카드가 들어올 때 시작 위치 (화면 너비 대비)
const ENTER_OFFSET = SCREEN_WIDTH * 0.25;

type Props = {
  quote?: Quote;
  isCustom: boolean;
  // 이미 지나온 명언을 다시 보고 있으면 true
  isRevisit: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  // 가장 멀리 본 명언으로 돌아간다
  onJumpToLatest: () => void;
};

const QuoteSwiper: React.FC<Props> = ({ quote, isCustom, isRevisit, canGoPrev, onNext, onPrev, onJumpToLatest }) => {
  const slideX = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

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

    if (isSwipeLeft) {
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

        {isRevisit && (
          // 부모 PanGestureHandler가 탭을 가로채지 않도록 감싼다 (quote-bar.tsx 참고)
          <Box position="absolute" bottom={16} left={0} right={0} alignItems="center" zIndex={20}>
            <NativeViewGestureHandler>
              <Pressable
                hitSlop={8}
                onPress={() => {
                  onJumpToLatest();
                  playEnter(ENTER_OFFSET);
                }}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  bg="$sidebarBackground"
                  px="md"
                  py="s"
                  borderRadius="hg"
                  borderWidth={1}
                  borderColor="$foreground"
                  style={{ gap: 4, opacity: 0.8 }}
                >
                  <Text fontSize={13} fontWeight="bold">
                    새 명언으로
                  </Text>
                  <FeatherIcon name="chevron-right" size={14} />
                </Box>
              </Pressable>
            </NativeViewGestureHandler>
          </Box>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default QuoteSwiper;

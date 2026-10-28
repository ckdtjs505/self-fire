// ─────────────────────────────────────────────────────────────
// campfire.tsx — 연속 점화 일수만큼 자라는 모닥불
//
//   - 장작 두세 개 위에 불꽃이 올라간다. 단계(utils/streak.ts)가 오를수록 불꽃 개수가 늘고,
//     같은 단계 안에서도 연속 일수에 따라 불꽃이 조금씩 커진다.
//   - 불꽃은 둥근 사각형을 45° 돌린 물방울 모양 3겹(바깥 적색 → 주황 → 노란 속불)으로 그린다.
//   - 0일(꺼진 장작)은 불 없이 연기만, 100일(황금 불꽃)은 금빛으로 탄다.
//   - 테마와 상관없이 밤하늘 같은 어두운 판 위에 그려 불빛이 잘 보이게 한다.
//   - 가운데 불꽃에 눈 둘·입 하나가 있다. 표정은 상태(utils/streak.ts getCampfireMood)를 따르고,
//     꺼졌으면 잉걸불 위에서 잠든다. 동그란 눈일 때는 가끔 눈을 깜빡인다.
//   - compact면 오늘 탭 상단용 미니 모닥불로 줄여 그린다.
// ─────────────────────────────────────────────────────────────

import { CampfireMood, campfireIntensity, getCampfireMood, getCampfireStage } from "@/utils/streak";
import { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const HEIGHT = 230;
const BASE_Y = 58; // 판 아래에서 불꽃 밑동까지
// 미니 모닥불(오늘 탭 상단): 같은 그림을 줄여 아래에 붙이고 위쪽 불티는 잘라 낸다.
// 줄이면 얼굴이 너무 작아지므로 얼굴만 조금 키운다.
const COMPACT_HEIGHT = 112;
const COMPACT_SCALE = 0.62;
const COMPACT_FACE_SCALE = 1.5;

const FIRE_COLORS = { outer: "#E8401C", middle: "#FF8A1F", core: "#FFD84A", glow: "#FF6A1F", spark: "#FFB347" };
const GOLD_COLORS = { outer: "#F29A0E", middle: "#FFC83D", core: "#FFF3C4", glow: "#FFC23D", spark: "#FFE08A" };
const SMOKE_COLOR = "#8A8079";
const FACE_COLOR = "#2B1408"; // 불꽃 위 얼굴
const ASH_FACE_COLOR = "#A39A92"; // 꺼진 잉걸불 위 잠든 얼굴

// 불빛 번짐을 이루는 원들의 크기 비율 (바깥 → 안쪽)
const GLOW_LAYERS = [1, 0.9, 0.8, 0.7, 0.61, 0.53, 0.46, 0.4, 0.34, 0.29];
// 잉걸불 알갱이 (가운데 기준 x, 밑동 기준 y, 반지름)
const COALS = [
  { x: -18, y: 0, r: 7 },
  { x: 16, y: 1, r: 6 },
  { x: -2, y: 3, r: 8 },
  { x: 8, y: -2, r: 5 },
  { x: -10, y: -3, r: 5 },
];

// 물방울 모양 한 겹. 아랫변 가운데를 기준으로 놓는다.
// 안쪽은 제자리에서 45° 돌려 뾰족한 모서리를 위로, 바깥은 밑동 기준으로 세로로 늘린다.
const Teardrop: React.FC<{ size: number; stretch: number; color: string; bottom: number }> = ({
  size,
  stretch,
  color,
  bottom,
}) => (
  <View
    style={{
      position: "absolute",
      bottom,
      left: -size / 2,
      width: size,
      height: size,
      transformOrigin: "bottom",
      transform: [{ scaleY: stretch }],
    }}
  >
    <View
      style={{
        flex: 1,
        backgroundColor: color,
        borderRadius: size / 2,
        borderTopRightRadius: 0,
        transform: [{ rotate: "-45deg" }],
      }}
    />
  </View>
);

// 모닥불 얼굴: 눈 둘과 입 하나를 size(불꽃 크기)에 비례해 그린다. 가운데를 기준(0)으로 놓는다.
//   - 잠(‿ ‿, o) · 기다림(● ●, ─) · 보통(● ●, ‿) · 기쁨(∩ ∩, 벌린 입) · 뿌듯함(─ ─, 큰 ‿)
//   - 동그란 눈일 때만 2.4~5.6초마다 깜빡이고, 네 번에 한 번은 두 번 연달아 깜빡인다.
const CampfireFace: React.FC<{ mood: CampfireMood; size: number; bottom: number; color: string; scale?: number }> = ({
  mood,
  size,
  bottom,
  color,
  scale = 1,
}) => {
  const eye = Math.max(4, size * 0.075) * scale;
  const stroke = Math.max(1.5, eye * 0.42);
  const canBlink = mood === "waiting" || mood === "content";

  const blink = useSharedValue(1);
  useEffect(() => {
    if (!canBlink) return;
    let timer: ReturnType<typeof setTimeout>;
    const close = () => withTiming(0.1, { duration: 70 });
    const open = () => withTiming(1, { duration: 110 });
    const schedule = () => {
      timer = setTimeout(() => {
        blink.value =
          Math.random() < 0.25 ? withSequence(close(), open(), close(), open()) : withSequence(close(), open());
        schedule();
      }, 2400 + Math.random() * 3200);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [blink, canBlink]);
  const blinkStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));

  // 위로 볼록(∩) 또는 아래로 볼록(‿)한 선
  const arc = (width: number, height: number, up: boolean): ViewStyle => ({
    width,
    height,
    borderColor: color,
    borderWidth: stroke,
    ...(up
      ? { borderBottomWidth: 0, borderTopLeftRadius: height, borderTopRightRadius: height }
      : { borderTopWidth: 0, borderBottomLeftRadius: height, borderBottomRightRadius: height }),
  });
  const line = (width: number): ViewStyle => ({ width, height: stroke, borderRadius: stroke, backgroundColor: color });

  const eyeStyle: ViewStyle = {
    sleep: arc(eye * 1.8, eye * 0.9, false),
    waiting: { width: eye, height: eye, borderRadius: eye / 2, backgroundColor: color },
    content: { width: eye, height: eye, borderRadius: eye / 2, backgroundColor: color },
    joy: arc(eye * 1.8, eye * 0.9, true),
    proud: line(eye * 1.7),
  }[mood];

  const mouthStyle: ViewStyle = {
    sleep: { width: eye * 0.9, height: eye * 0.9, borderRadius: eye, borderWidth: stroke, borderColor: color },
    waiting: line(eye * 1.4),
    content: arc(eye * 2, eye * 0.9, false),
    joy: {
      width: eye * 2.4,
      height: eye * 1.2,
      borderBottomLeftRadius: eye * 1.2,
      borderBottomRightRadius: eye * 1.2,
      backgroundColor: color,
    },
    proud: arc(eye * 2.6, eye * 1.1, false),
  }[mood];

  const width = eye * 6;
  return (
    <View pointerEvents="none" style={{ position: "absolute", bottom, left: -width / 2, width, alignItems: "center" }}>
      <View style={{ flexDirection: "row", gap: eye * 0.8, alignItems: "center" }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ width: eye * 2, alignItems: "center" }}>
            <Animated.View style={[eyeStyle, canBlink && blinkStyle]} />
          </View>
        ))}
      </View>
      <View style={[mouthStyle, { marginTop: eye * 0.7 }]} />
    </View>
  );
};

type FlameProps = {
  x: number;
  size: number;
  colors: typeof FIRE_COLORS;
  delay: number;
  duration: number;
  mood?: CampfireMood; // 있으면 이 불꽃에 얼굴을 그린다 (가운데 불꽃)
  faceScale?: number;
};

// 불꽃 하나: 밑동을 기준으로 위아래로 넘실대며 좌우로 살짝 흔들린다.
const Flame: React.FC<FlameProps> = ({ x, size, colors, delay, duration, mood, faceScale }) => {
  const flicker = useSharedValue(0);

  useEffect(() => {
    flicker.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [flicker, delay, duration]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: 0.86 + flicker.value * 0.22 },
      { scaleX: 1.04 - flicker.value * 0.1 },
      { rotate: `${(flicker.value - 0.5) * 6}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ position: "absolute", left: x, bottom: BASE_Y, transformOrigin: "bottom" }, animStyle]}>
      <Teardrop size={size} stretch={1.5} color={colors.outer} bottom={0} />
      <Teardrop size={size * 0.68} stretch={1.45} color={colors.middle} bottom={size * 0.04} />
      <Teardrop size={size * 0.4} stretch={1.4} color={colors.core} bottom={size * 0.06} />
      {mood && <CampfireFace mood={mood} size={size} bottom={size * 0.2} color={FACE_COLOR} scale={faceScale} />}
    </Animated.View>
  );
};

// 위로 떠오르며 사라지는 불티(또는 꺼진 장작의 연기)
const Particle: React.FC<{ x: number; size: number; color: string; rise: number; delay: number; duration: number }> = ({
  x,
  size,
  color,
  rise,
  delay,
  duration,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.quad) }), -1));
  }, [progress, delay, duration]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.2 ? progress.value * 5 : 1 - (progress.value - 0.2) / 0.8,
    transform: [{ translateY: -rise * progress.value }, { translateX: Math.sin(progress.value * 6) * 6 }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - size / 2,
          bottom: BASE_Y + 20,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
};

// 장작 한 토막: 나무 몸통 + 밝은 나이테 단면
const Log: React.FC<{ width: number; rotate: number; bottom: number; color?: string }> = ({
  width,
  rotate,
  bottom,
  color = "#5B3A24",
}) => (
  <View
    style={{
      position: "absolute",
      bottom,
      left: -width / 2,
      width,
      height: 20,
      borderRadius: 10,
      backgroundColor: color,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.35)",
      transform: [{ rotate: `${rotate}deg` }],
      justifyContent: "center",
    }}
  >
    <View style={{ position: "absolute", right: 2, width: 15, height: 15, borderRadius: 8, backgroundColor: "#A0774F" }}>
      <View style={{ margin: 4, width: 7, height: 7, borderRadius: 4, borderWidth: 1, borderColor: "#6E4B30" }} />
    </View>
  </View>
);

// 불꽃 배치: 가운데가 가장 크고 바깥으로 갈수록 작아진다. (가운데 불꽃을 마지막에 그려 앞에 보이게)
const layoutFlames = (count: number, intensity: number) => {
  const maxSize = 30 + 40 * intensity;
  const spacing = 13 + 4 * intensity;
  const half = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => {
    const offset = i - half;
    const falloff = half === 0 ? 0 : Math.abs(offset) / half;
    return {
      key: i,
      x: offset * spacing,
      size: maxSize * (1 - 0.45 * falloff),
      delay: (i * 137) % 400,
      duration: 380 + ((i * 89) % 220),
      depth: Math.abs(offset),
    };
  }).sort((a, b) => b.depth - a.depth);
};

type Props = {
  streak: number;
  dimmed?: boolean; // 오늘 아직 점화하지 않았으면 불을 조금 죽여 보여 준다
  cheer?: boolean; // 막 점화했을 때(점화 결과 시트) 기뻐하는 얼굴
  compact?: boolean; // 오늘 탭 상단의 미니 모닥불
};

const Campfire: React.FC<Props> = ({ streak, dimmed, cheer, compact }) => {
  const stage = getCampfireStage(streak);
  const mood = getCampfireMood(streak, { dimmed, cheer });
  const faceScale = compact ? COMPACT_FACE_SCALE : 1;
  const intensity = campfireIntensity(streak);
  const colors = stage.level === 5 ? GOLD_COLORS : FIRE_COLORS;
  const flames = layoutFlames(stage.flames, intensity);
  const isOut = stage.level === 0;

  // 불빛 번짐: 불이 클수록 넓고 밝게, 천천히 숨 쉬듯
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow]);
  const glowSize = 140 + 220 * intensity;
  const glowStyle = useAnimatedStyle(() => ({
    opacity: (0.5 + 0.5 * intensity) * (0.85 + glow.value * 0.15),
    transform: [{ scale: 0.95 + glow.value * 0.08 }],
  }));

  const sparkCount = isOut ? 4 : Math.min(2 + stage.level * 2, 10);

  return (
    <View style={[styles.panel, compact && styles.compactPanel]} accessibilityLabel={`${stage.name}, ${streak}일 연속 점화`}>
      {/* 그림 전체를 담는 판. 미니일 때는 아래쪽 가운데를 기준으로 줄인다 */}
      <View style={[styles.stage, compact && { transform: [{ scale: COMPACT_SCALE }] }]}>
        {/* 불빛 번짐: 옅은 원을 여러 겹 겹쳐 가장자리가 부드럽게 퍼지는 빛을 흉내 낸다 */}
        {!isOut && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                bottom: BASE_Y + 20 - glowSize / 2,
                alignSelf: "center",
                width: glowSize,
                height: glowSize,
                justifyContent: "center",
                alignItems: "center",
              },
              glowStyle,
            ]}
          >
            {GLOW_LAYERS.map((ratio) => (
              <View
                key={ratio}
                style={{
                  position: "absolute",
                  width: glowSize * ratio,
                  height: glowSize * ratio,
                  borderRadius: (glowSize * ratio) / 2,
                  backgroundColor: colors.glow,
                  opacity: 0.045,
                }}
              />
            ))}
          </Animated.View>
        )}

        {/* 바닥 그림자 */}
        <View style={styles.groundShadow} />

        {/* 가운데를 기준(0)으로 장작·불꽃·불티를 놓는다 */}
        <View style={[styles.center, { opacity: dimmed ? 0.55 : 1 }]}>
          {stage.level >= 3 && <Log width={150} rotate={0} bottom={BASE_Y - 34} color="#4A2F1D" />}
          <Log width={140} rotate={-16} bottom={BASE_Y - 24} />
          <Log width={140} rotate={16} bottom={BASE_Y - 24} color="#664128" />

          {/* 장작이 엇갈린 자리의 잉걸불: 꺼졌으면 잿빛, 타고 있으면 붉게 */}
          {COALS.map((c, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: BASE_Y - 10 + c.y,
                left: c.x - c.r,
                width: c.r * 2,
                height: c.r * 2,
                borderRadius: c.r,
                backgroundColor: isOut ? "#3A3330" : i % 2 ? colors.middle : colors.outer,
              }}
            />
          ))}

          {isOut && (
            <CampfireFace mood={mood} size={56} bottom={BASE_Y - 14} color={ASH_FACE_COLOR} scale={faceScale} />
          )}

          {flames.map((f) => (
            <Flame
              key={f.key}
              x={f.x}
              size={f.size}
              colors={colors}
              delay={f.delay}
              duration={f.duration}
              mood={f.depth === 0 ? mood : undefined}
              faceScale={faceScale}
            />
          ))}

          {Array.from({ length: sparkCount }, (_, i) => (
            <Particle
              key={i}
              x={((i * 37) % 70) - 35}
              size={isOut ? 10 + (i % 3) * 4 : 3 + (i % 3)}
              color={isOut ? SMOKE_COLOR : colors.spark}
              rise={isOut ? 90 : 90 + 60 * intensity}
              delay={i * 330}
              duration={isOut ? 2600 : 1500 + (i % 4) * 250}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    height: HEIGHT,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#100B0A",
  },
  compactPanel: {
    height: COMPACT_HEIGHT,
    borderRadius: 18,
  },
  stage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: HEIGHT,
    transformOrigin: "bottom",
  },
  center: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
  },
  groundShadow: {
    position: "absolute",
    bottom: BASE_Y - 48,
    alignSelf: "center",
    width: 210,
    height: 22,
    borderRadius: 100,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});

export default Campfire;

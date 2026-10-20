// ─────────────────────────────────────────────────────────────
// ignite-screen.tsx — Hold to Ignite 인터랙션 오버레이
//
// 불타는 인터랙션:
//   - 여러 글로우 레이어(3단계)가 파동치듯 확장
//   - 불씨가 랜덤하게 깜빡임(flicker)
//   - 열기 파티클 6개가 위로 떠오름
//   - 홀드 진행 시 색상이 어두운 적색 → 밝은 황금빛으로 변화
//   - 완료 시 강렬한 플래시 + 스파크 터짐
//   - 누르는 동안 점점 세지는 진동, 점화 순간 완료 진동
//   - 스크린리더: 두 번 탭(activate)하면 바로 점화
//   - 기기의 '동작 줄이기'가 켜져 있으면 깜빡임·맥박·파티클·플래시 없이 홀드 진행과 페이드만 보여 준다
//   - 오늘의 명언 첫머리를 흐릿하게 미리 보여 주어, 불씨를 켜면 무엇이 기다리는지 알려 준다
// ─────────────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Easing, useWindowDimensions } from 'react-native';
import { Text } from '@/atom';
// 테마를 거치지 않고 직접 Ionicons를 사용 → hex 색상이 그대로 적용됨
import { Ionicons } from '@expo/vector-icons';
import { pulseHaptic, successHaptic } from '@/utils/haptics';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const HOLD_DURATION = 1500; // 점화까지 필요한 홀드 시간 (ms)
const HAPTIC_INTERVAL = 250; // 누르는 동안 진동 간격 (ms)

// ── 파티클 설정 ────────────────────────────────────────────────
// 위로 떠오르는 열기 파티클의 초기 위치 오프셋 목록
const PARTICLES = [
  { x: -55, size: 5, delay: 0,   dur: 1800 },
  { x:  40, size: 7, delay: 300, dur: 2200 },
  { x: -20, size: 4, delay: 600, dur: 1600 },
  { x:  65, size: 6, delay: 200, dur: 2000 },
  { x: -70, size: 5, delay: 500, dur: 1900 },
  { x:  20, size: 8, delay: 100, dur: 2400 },
];

// 미리 보여 줄 명언 첫머리 글자 수
const PREVIEW_LENGTH = 14;

type Props = {
  onIgnited: () => void;
  // 불씨를 켜면 보게 될 오늘의 명언 (첫머리만 흐릿하게 보여 준다)
  previewText?: string;
};

export const IgniteScreen: React.FC<Props> = ({ onIgnited, previewText }) => {
  // 회전·창 크기 변경에 맞춰 다시 계산되도록 렌더 시점에 읽는다.
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  // 홀드 취소 콜백 등에서 최신 값을 읽기 위한 ref
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  // ── 핵심 애니메이션 값 ──────────────────────────────────────
  const progress   = useRef(new Animated.Value(0)).current; // 홀드 진행도 (0→1)
  const revealAnim = useRef(new Animated.Value(1)).current; // 오버레이 불투명도 (1→0)
  const flash      = useRef(new Animated.Value(0)).current; // 완료 플래시 밝기
  const flicker    = useRef(new Animated.Value(1)).current; // 불씨 깜빡임
  const idlePulse  = useRef(new Animated.Value(1)).current; // 대기 중 맥박

  // 파티클별 애니메이션 값 (Y축 이동 + 투명도)
  const particles = useRef(
    PARTICLES.map(() => ({
      y:       new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const isCompleted  = useRef(false);
  const idleLoopRef  = useRef<Animated.CompositeAnimation | null>(null);
  const flickerRef   = useRef<Animated.CompositeAnimation | null>(null);
  const particleRefs = useRef<Animated.CompositeAnimation[]>([]);
  const hapticTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHaptics = () => {
    if (hapticTimer.current) clearInterval(hapticTimer.current);
    hapticTimer.current = null;
  };

  // ── progress 파생 애니메이션 ────────────────────────────────
  // 불씨 크기: 1x → 3x
  const flameScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 3.0] });
  // 글로우 1 (가장 안쪽 — 뜨거운 황백색)
  const glow1Scale   = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 3.2] });
  const glow1Opacity = progress.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.95, 1.0] });
  // 글로우 2 (중간 — 주황색)
  const glow2Scale   = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 5.0] });
  const glow2Opacity = progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.65, 0.90] });
  // 글로우 3 (바깥 — 붉은 연기빛)
  const glow3Scale   = progress.interpolate({ inputRange: [0, 1], outputRange: [0.2, 8.0] });
  const glow3Opacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.2, 0.55] });
  // 배경 색상: 완전 검정 → 짙은 붉은빛으로 달아오름
  const bgRedTint    = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] });
  // 힌트 텍스트: 홀드 시작 시 빠르게 사라짐
  const hintOpacity  = progress.interpolate({ inputRange: [0, 0.12], outputRange: [1, 0] });

  // ── 루프 애니메이션 시작 (동작 줄이기 설정이 바뀌면 다시 맞춘다) ──
  useEffect(() => {
    if (!reduceMotion) {
      startIdlePulse();
      startFlicker();
      startParticles();
    }
    const particleAnims = particleRefs.current;
    return () => {
      idleLoopRef.current?.stop();
      flickerRef.current?.stop();
      particleAnims.forEach(a => a.stop());
      // 멈춘 자리에 남지 않도록 기본값으로 되돌린다.
      idlePulse.setValue(1);
      flicker.setValue(1);
      particles.forEach(p => p.opacity.setValue(0));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  // 화면이 사라질 때 진동을 멈춘다.
  useEffect(() => stopHaptics, []);

  // ── Idle Pulse: 은은한 숨쉬기 ──────────────────────────────
  const startIdlePulse = () => {
    idlePulse.setValue(1);
    if (reduceMotionRef.current) return;
    idleLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(idlePulse, { toValue: 1.2,  duration: 750, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(idlePulse, { toValue: 1.0,  duration: 750, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    idleLoopRef.current.start();
  };

  // ── Flicker: 실제 불꽃처럼 무작위 깜빡임 ────────────────────
  const startFlicker = () => {
    const flickerStep = () => {
      const toValue  = 0.75 + Math.random() * 0.35; // 0.75 ~ 1.10
      const duration = 60  + Math.random() * 120;   // 60ms ~ 180ms
      flickerRef.current = Animated.timing(flicker, {
        toValue,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      });
      flickerRef.current.start(({ finished }) => {
        if (finished) flickerStep(); // 재귀적으로 계속 깜빡임
      });
    };
    flickerStep();
  };

  // ── 파티클: 위로 떠오르는 열기 점들 ─────────────────────────
  const startParticles = () => {
    PARTICLES.forEach((cfg, i) => {
      const loop = () => {
        particles[i].y.setValue(0);
        particles[i].opacity.setValue(0);
        const anim = Animated.sequence([
          Animated.delay(cfg.delay),
          Animated.parallel([
            Animated.timing(particles[i].y, {
              toValue: -(120 + Math.random() * 80), // 120~200px 위로 이동
              duration: cfg.dur,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
            }),
            Animated.sequence([
              Animated.timing(particles[i].opacity, { toValue: 0.9,  duration: cfg.dur * 0.3, useNativeDriver: true }),
              Animated.timing(particles[i].opacity, { toValue: 0,    duration: cfg.dur * 0.7, useNativeDriver: true }),
            ]),
          ]),
        ]);
        particleRefs.current[i] = anim;
        anim.start(({ finished }) => { if (finished) loop(); }); // 반복
      };
      loop();
    });
  };

  // ── startHold: 손가락을 올렸을 때 ────────────────────────────
  const startHold = () => {
    if (isCompleted.current) return;
    idleLoopRef.current?.stop(); // idle 맥박 정지
    idlePulse.setValue(1);

    // 누르고 있는 동안 진동이 점점 세진다.
    const startedAt = Date.now();
    pulseHaptic(0);
    stopHaptics();
    hapticTimer.current = setInterval(() => {
      pulseHaptic((Date.now() - startedAt) / HOLD_DURATION);
    }, HAPTIC_INTERVAL);

    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad), // 끝에 가까울수록 느려지며 긴장감 상승
    }).start(({ finished }) => {
      if (finished && !isCompleted.current) {
        complete();
      }
    });
  };

  // ── cancelHold: 손가락을 뗐을 때 ────────────────────────────
  const cancelHold = () => {
    if (isCompleted.current) return;
    stopHaptics();
    progress.stopAnimation();
    Animated.spring(progress, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => startIdlePulse()); // idle 재시작
  };

  // ── complete: 점화 완료 (홀드 끝 또는 스크린리더의 두 번 탭) ──
  const complete = () => {
    if (isCompleted.current) return;
    isCompleted.current = true;
    stopHaptics();
    successHaptic();
    triggerReveal();
  };

  // ── triggerReveal: 점화 완료 애니메이션 ─────────────────────
  const triggerReveal = () => {
    flickerRef.current?.stop();
    // 동작 줄이기: 플래시 없이 오버레이만 천천히 걷어 낸다.
    if (reduceMotionRef.current) {
      Animated.timing(revealAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => onIgnited());
      return;
    }
    // 1) 강렬한 화이트 플래시 (빠르게 빵!)
    // 2) 플래시 천천히 빠지면서 동시에 오버레이 전체 페이드 아웃
    Animated.sequence([
      Animated.timing(flash, { toValue: 1,   duration: 120, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(flash,      { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(revealAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start(() => onIgnited());
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.container, { opacity: revealAnim }]}>

      {/* ── 배경 붉은 달아오름 (진행할수록 배경이 약간 붉어짐) ── */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FF2200', opacity: bgRedTint }]}
      />

      {/* ── 글로우 3: 가장 넓은 적색 잔광 ────────────────────── */}
      <Animated.View style={[styles.glowBase, styles.glow3, { opacity: glow3Opacity, transform: [{ scale: glow3Scale }] }]} />

      {/* ── 글로우 2: 중간 주황빛 ─────────────────────────────── */}
      <Animated.View style={[styles.glowBase, styles.glow2, { opacity: glow2Opacity, transform: [{ scale: glow2Scale }] }]} />

      {/* ── 글로우 1: 뜨거운 황백색 코어 ─────────────────────── */}
      <Animated.View style={[styles.glowBase, styles.glow1, { opacity: glow1Opacity, transform: [{ scale: glow1Scale }] }]} />

      {/* ── 열기 파티클들 (위로 떠오르는 불씨 잔불) ──────────── */}
      {PARTICLES.map((cfg, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.particle,
            {
              width: cfg.size,
              height: cfg.size,
              borderRadius: cfg.size / 2,
              left: width / 2 + cfg.x - cfg.size / 2,
              bottom: height / 2,
              opacity: particles[i].opacity,
              transform: [{ translateY: particles[i].y }],
            },
          ]}
        />
      ))}

      {/* ── 불씨 아이콘 (홀드 감지 + 깜빡임 + 크기 변화) ──────
          onTouchStart/End 사용: 손가락이 미세하게 움직여도
          홀드가 끊기지 않도록 Pressable 대신 Animated.View 터치 이벤트 사용 */}
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel="오늘의 불씨 켜기"
        accessibilityHint="꾹 누르거나 두 번 탭하면 오늘의 불씨가 켜집니다"
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'activate') complete(); }}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
        style={[styles.flameTouchArea, {
          opacity: flicker,
          transform: [
            { scale: Animated.multiply(idlePulse, flameScale) as unknown as number },
          ],
        }]}
      >
        {/* 불씨 아이콘 — 하나만 사용, 강렬한 주황-빨강 */}
        <Ionicons name="flame" size={92} color="#FF4500" />
      </Animated.View>

      {/* ── 오늘의 명언 미리보기 (첫머리만 흐릿하게) ─────────── */}
      {!!previewText && (
        <Animated.View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[styles.previewContainer, { top: height * 0.16, opacity: hintOpacity }]}
        >
          <Text style={styles.previewLabel}>오늘의 문장</Text>
          <Text style={styles.previewText} numberOfLines={1}>
            {`“${previewText.slice(0, PREVIEW_LENGTH).trim()}${previewText.length > PREVIEW_LENGTH ? '…' : '”'}`}
          </Text>
        </Animated.View>
      )}

      {/* ── 힌트 텍스트 ──────────────────────────────────────── */}
      <Animated.View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[styles.hintContainer, { bottom: height * 0.2, opacity: hintOpacity }]}>
        <Text style={styles.hintText}>꾹 누르면{'\n'}오늘의 불씨가 켜집니다</Text>
      </Animated.View>

      {/* ── 점화 완료 순간 화이트/황금빛 플래시 ─────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#FFF0D0', opacity: flash }]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 200,
    backgroundColor: '#060608',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowBase: {
    position: 'absolute',
    borderRadius: 9999,
  },
  // 코어 — 황백색 (가장 뜨거운 영역)
  glow1: {
    width: 100,
    height: 100,
    backgroundColor: '#FFE040',
  },
  // 중간 — 주황빛 불꽃
  glow2: {
    width: 140,
    height: 140,
    backgroundColor: '#FF5000',
  },
  // 외곽 — 짙은 붉은 잔광
  glow3: {
    width: 160,
    height: 160,
    backgroundColor: '#CC1000',
  },
  // 열기 파티클 — 떠오르는 작은 불씨 점
  particle: {
    position: 'absolute',
    backgroundColor: '#FFAA00',
  },
  flameTouchArea: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  previewContainer: {
    position: 'absolute',
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  previewLabel: {
    color: 'rgba(255, 190, 120, 0.55)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  previewText: {
    color: 'rgba(255, 236, 214, 0.42)',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  hintText: {
    color: 'rgba(255, 190, 120, 0.8)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.8,
  },
});

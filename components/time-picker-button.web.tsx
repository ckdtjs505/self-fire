// ─────────────────────────────────────────────────────────────
// time-picker-button.web.tsx
// 웹용 알림 시각 버튼. 시스템 시간 선택기가 없어 ‹ 시 › : ‹ 분 › 버튼으로 조절한다.
// (시: 1시간, 분: 5분 단위)
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import FeatherIcon from "@/components/icon";
import { Pressable } from "react-native";
import type { TimePickerButtonProps } from "./time-picker-button";

const MINUTE_STEP = 5;

const pad2 = (value: number) => String(value).padStart(2, "0");

// value에 step을 더하되 [0, max] 범위를 벗어나면 반대쪽 끝으로 순환한다.
const stepWithWrap = (value: number, step: number, max: number) => {
  const next = value + step;
  if (next > max) return 0;
  if (next < 0) return max;
  return next;
};

// ‹ 값 › 형태의 시간 조절 버튼
const TimeStepper: React.FC<{ value: number; unit: string; onDecrease: () => void; onIncrease: () => void }> = ({
  value,
  unit,
  onDecrease,
  onIncrease,
}) => (
  <Box flexDirection="row" alignItems="center" bg="$surfaceMuted" borderRadius="sm" style={{ padding: 2 }}>
    <Pressable onPress={onDecrease} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${unit} 줄이기`} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}>
      <FeatherIcon name="chevron-left" size={16} color="$muted" />
    </Pressable>
    <Text fontSize={16} fontWeight="800" style={{ minWidth: 24, textAlign: "center", fontVariant: ["tabular-nums"] }}>
      {pad2(value)}
    </Text>
    <Pressable onPress={onIncrease} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${unit} 늘리기`} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}>
      <FeatherIcon name="chevron-right" size={16} color="$muted" />
    </Pressable>
  </Box>
);

export default function TimePickerButton({ hour, minute, onChange }: TimePickerButtonProps) {
  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <TimeStepper
        value={hour}
        unit="시"
        onDecrease={() => onChange(stepWithWrap(hour, -1, 23), minute)}
        onIncrease={() => onChange(stepWithWrap(hour, 1, 23), minute)}
      />
      <Text fontSize={16} fontWeight="800" color="$muted">:</Text>
      <TimeStepper
        value={minute}
        unit="분"
        onDecrease={() => onChange(hour, stepWithWrap(minute, -MINUTE_STEP, 60 - MINUTE_STEP))}
        onIncrease={() => onChange(hour, stepWithWrap(minute, MINUTE_STEP, 60 - MINUTE_STEP))}
      />
    </Box>
  );
}

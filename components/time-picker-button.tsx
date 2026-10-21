// ─────────────────────────────────────────────────────────────
// time-picker-button.tsx
// 알림 시각을 고르는 버튼. 시스템 시간 선택기를 쓴다.
//   - Android: 시각을 누르면 시스템 시계 다이얼로그가 뜬다.
//   - iOS: 시스템 compact 선택기를 그대로 그린다. (누르면 휠이 펼쳐진다)
// 웹은 시스템 선택기가 없어 time-picker-button.web.tsx의 ‹ › 버튼을 쓴다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { useAppTheme } from "@/themes";
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Platform, Pressable } from "react-native";

export type TimePickerButtonProps = {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  accessibilityLabel: string;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

// 8:05 → "오전 8:05", 21:30 → "오후 9:30"
export const formatTime = (hour: number, minute: number) =>
  `${hour < 12 ? "오전" : "오후"} ${hour % 12 === 0 ? 12 : hour % 12}:${pad2(minute)}`;

const toDate = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
};

export default function TimePickerButton({ hour, minute, onChange, accessibilityLabel }: TimePickerButtonProps) {
  const { colors } = useAppTheme();

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type !== "set" || !date) return;
    if (date.getHours() === hour && date.getMinutes() === minute) return;
    onChange(date.getHours(), date.getMinutes());
  };

  if (Platform.OS === "ios") {
    return (
      <DateTimePicker
        value={toDate(hour, minute)}
        mode="time"
        display="compact"
        locale="ko-KR"
        accentColor={colors.$primary}
        onChange={handleChange}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  const open = () =>
    DateTimePickerAndroid.open({ value: toDate(hour, minute), mode: "time", is24Hour: false, onChange: handleChange });

  return (
    <Pressable
      onPress={open}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: formatTime(hour, minute) }}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <Box bg="$surfaceMuted" borderRadius="sm" style={{ paddingHorizontal: 12, paddingVertical: 7 }}>
        <Text fontSize={16} fontWeight="800" style={{ fontVariant: ["tabular-nums"] }}>
          {formatTime(hour, minute)}
        </Text>
      </Box>
    </Pressable>
  );
}

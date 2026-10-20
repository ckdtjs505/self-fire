// ─────────────────────────────────────────────────────────────
// widget-options.tsx
// 홈 화면에 놓을 위젯 고르기: 오늘의 명언(4×2) / 불씨(2×2).
// 누르면 런처의 위젯 추가 창을 띄운다. (widgets/widget-pin.ts)
// 점화 완료 시트와 설정 > 홈 화면 위젯에서 같이 쓴다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { FLAME_WIDGET, QUOTE_WIDGET } from "@/widgets/self-fire-widgets";
import { pinWidget, WidgetName } from "@/widgets/widget-pin";
import { Pressable } from "react-native";
import { Ionicon } from "./icon";

const OPTIONS: { name: WidgetName; title: string; size: string; wide: boolean }[] = [
  { name: QUOTE_WIDGET, title: "오늘의 명언", size: "4×2 · 명언과 불씨", wide: true },
  { name: FLAME_WIDGET, title: "불씨", size: "2×2 · 이어 온 날", wide: false },
];

type Props = {
  // 어디서 눌렀는지 (분석용)
  source: string;
  // 추가 창을 띄운 뒤 호출 (시트 닫기 등)
  onPicked?: () => void;
};

const WidgetOptions: React.FC<Props> = ({ source, onPicked }) => {
  const pick = async (name: WidgetName) => {
    onPicked?.();
    await pinWidget(name, source);
  };

  return (
    <Box flexDirection="row" style={{ gap: 10 }}>
      {OPTIONS.map((option) => (
        <Pressable
          key={option.name}
          onPress={() => pick(option.name)}
          accessibilityRole="button"
          accessibilityLabel={`${option.title} 위젯 추가`}
          style={({ pressed }) => ({ flex: option.wide ? 3 : 2, opacity: pressed ? 0.7 : 1 })}
        >
          <Box bg="$surfaceMuted" borderRadius="md" padding="md" style={{ gap: 10 }}>
            {/* 위젯 모양 미리보기 */}
            <Box
              height={64}
              borderRadius="sm"
              bg="$background"
              borderWidth={1}
              borderColor="$border"
              justifyContent="center"
              alignItems="center"
              flexDirection="row"
              style={{ gap: 6, aspectRatio: option.wide ? 2 : 1, alignSelf: "center" }}
            >
              <Ionicon name="flame" size={option.wide ? 18 : 24} color="$flame" />
              {option.wide && <Box width={44} height={6} borderRadius="pill" bg="$border" />}
            </Box>
            <Box style={{ gap: 2 }}>
              <Text fontSize={14} fontWeight="800">
                {option.title}
              </Text>
              <Text variant="caption" fontSize={12}>
                {option.size}
              </Text>
            </Box>
          </Box>
        </Pressable>
      ))}
    </Box>
  );
};

export default WidgetOptions;

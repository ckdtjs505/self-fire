// ─────────────────────────────────────────────────────────────
// widget-style-sheet.tsx
// 설정 > 위젯 꾸미기: 색상, 배경 투명도, 명언 글자 크기, 작가 표시를 고른다.
// 위쪽에 배경화면 위에 놓인 위젯 모양을 그려 바로 확인하고, 고르면 홈 화면 위젯도 곧바로 다시 그린다.
// 미리보기는 RN으로 흉내 낸 것이고, 실제 위젯은 widgets/self-fire-widgets.tsx 가 그린다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import {
  getWidgetPalette,
  getWidgetTextScale,
  WIDGET_OPACITIES,
  WIDGET_PALETTES,
  WIDGET_TEXT_SIZES,
  withOpacity,
} from "@/data/widget-style";
import { useStreakStore } from "@/store/streak";
import { useWidgetStyleStore } from "@/store/widget-style";
import { QUOTE_MARK_FONT } from "@/utils/fonts";
import { forwardRef } from "react";
import { ImageBackground, Pressable, useColorScheme } from "react-native";
import { useShallow } from "zustand/react/shallow";
import FeatherIcon from "./icon";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import { SettingSwitch } from "./setting-item";

// 투명도가 잘 보이도록 미리보기 뒤에 깔 배경화면
const WALLPAPER = require("@/assets/images/card-bg/forest.jpg");
// 위젯 명언 글꼴(나눔명조 굵게)과 가까운, 앱에 늘 올라와 있는 글꼴로 흉내 낸다.
const SAMPLE_QUOTE = { text: "작은 불씨 하나가 온 들판을 태운다.", author: "selfFire" };

const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text fontSize={15} fontWeight="700" style={{ marginTop: 24, marginBottom: 12 }}>
    {children}
  </Text>
);

// 한 줄에 나란히 놓는 선택 칩 (투명도·글자 크기)
const Chip: React.FC<{ label: string; selected: boolean; onPress: () => void }> = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={label}
    style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}
  >
    <Box
      height={40}
      borderRadius="sm"
      borderWidth={1.5}
      borderColor={selected ? "$primary" : "$border"}
      bg={selected ? "$primarySoft" : "$surfaceMuted"}
      justifyContent="center"
      alignItems="center"
    >
      <Text fontSize={14} fontWeight={selected ? "800" : "600"}>
        {label}
      </Text>
    </Box>
  </Pressable>
);

const WidgetStyleSheet = forwardRef<PickerSheetHandle>(function WidgetStyleSheet(_props, ref) {
  const { paletteId, opacity, textSize, showAuthor, updateStyle, resetStyle } = useWidgetStyleStore(
    useShallow((s) => ({
      paletteId: s.paletteId,
      opacity: s.opacity,
      textSize: s.textSize,
      showAuthor: s.showAuthor,
      updateStyle: s.updateStyle,
      resetStyle: s.resetStyle,
    }))
  );
  const streak = useStreakStore((s) => s.currentStreak);
  // '자동'은 실제 위젯처럼 시스템 다크 모드에 맞춘다.
  const c = getWidgetPalette(paletteId, useColorScheme() === "dark");
  const quoteSize = Math.round(12 * getWidgetTextScale(textSize));
  const background = withOpacity(c.background, opacity);

  return (
    <PickerSheet ref={ref} title="위젯 꾸미기" description="홈 화면 위젯의 색과 모양을 바꿔요. 고르면 바로 적용돼요">
      {/* 미리보기: 배경화면 위에 명언 위젯(4×2)과 불씨 위젯(2×2) */}
      <ImageBackground
        source={WALLPAPER}
        accessibilityLabel="위젯 미리보기"
        style={{ borderRadius: 20, overflow: "hidden", padding: 14, flexDirection: "row", gap: 10 }}
      >
        <Box
          flex={2}
          borderRadius="md"
          justifyContent="space-between"
          style={{ aspectRatio: 2, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: background }}
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text fontSize={9} fontWeight="700" style={{ color: c.muted }}>
              오늘의 명언
            </Text>
            <Box
              borderRadius="pill"
              style={{ backgroundColor: c.flameSoft, paddingHorizontal: 6, paddingVertical: 1 }}
            >
              <Text fontSize={9} fontWeight="700" style={{ color: c.flame }}>
                {`🔥 ${streak}일째`}
              </Text>
            </Box>
          </Box>
          <Text
            numberOfLines={2}
            style={{
              color: c.foreground,
              fontFamily: QUOTE_MARK_FONT,
              fontSize: quoteSize,
              lineHeight: Math.round(quoteSize * 1.45),
            }}
          >
            {SAMPLE_QUOTE.text}
          </Text>
          <Text fontSize={9} style={{ color: c.muted, textAlign: "right", opacity: showAuthor ? 1 : 0 }}>
            {`— ${SAMPLE_QUOTE.author}`}
          </Text>
        </Box>
        <Box
          flex={1}
          borderRadius="md"
          justifyContent="center"
          alignItems="center"
          style={{ aspectRatio: 1, backgroundColor: background }}
        >
          <Text fontSize={22}>🔥</Text>
          <Text fontSize={18} fontWeight="900" style={{ color: c.flame }}>
            {streak}
            <Text fontSize={10} fontWeight="700" style={{ color: c.muted }}>
              {" 일째"}
            </Text>
          </Text>
        </Box>
      </ImageBackground>

      <SectionTitle>색상</SectionTitle>
      <Box flexDirection="row" flexWrap="wrap" style={{ gap: 14 }}>
        {WIDGET_PALETTES.map((p) => {
          const selected = p.id === paletteId;
          return (
            <Pressable
              key={p.id}
              onPress={() => updateStyle({ paletteId: p.id })}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${p.name} 색상`}
              style={({ pressed }) => ({ alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1 })}
            >
              <Box
                width={48}
                height={48}
                borderRadius="pill"
                borderWidth={2}
                borderColor={selected ? "$primary" : "$border"}
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                style={{ overflow: "hidden" }}
              >
                {/* 자동은 라이트/다크를 반씩 보여 준다 */}
                <Box flex={1} alignSelf="stretch" style={{ backgroundColor: p.light.background }} />
                <Box flex={1} alignSelf="stretch" style={{ backgroundColor: p.dark.background }} />
                <Box
                  position="absolute"
                  width={14}
                  height={14}
                  borderRadius="pill"
                  style={{ backgroundColor: p.light.flame }}
                />
              </Box>
              <Text fontSize={12} fontWeight={selected ? "800" : "500"}>
                {p.name}
              </Text>
            </Pressable>
          );
        })}
      </Box>

      <SectionTitle>배경 투명도</SectionTitle>
      <Box flexDirection="row" style={{ gap: 8 }}>
        {WIDGET_OPACITIES.map((value) => (
          <Chip
            key={value}
            label={value === 100 ? "불투명" : `${100 - value}%`}
            selected={value === opacity}
            onPress={() => updateStyle({ opacity: value })}
          />
        ))}
      </Box>

      <SectionTitle>명언 글자 크기</SectionTitle>
      <Box flexDirection="row" style={{ gap: 8 }}>
        {WIDGET_TEXT_SIZES.map((size) => (
          <Chip
            key={size.id}
            label={size.name}
            selected={size.id === textSize}
            onPress={() => updateStyle({ textSize: size.id })}
          />
        ))}
      </Box>

      <Box flexDirection="row" alignItems="center" justifyContent="space-between" style={{ marginTop: 24 }}>
        <Text fontSize={15} fontWeight="700">
          작가 이름 표시
        </Text>
        <SettingSwitch value={showAuthor} onValueChange={(value) => updateStyle({ showAuthor: value })} />
      </Box>

      <Pressable
        onPress={resetStyle}
        accessibilityRole="button"
        style={({ pressed }) => ({ alignSelf: "center", marginTop: 28, padding: 8, opacity: pressed ? 0.5 : 1 })}
      >
        <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
          <FeatherIcon name="rotate-ccw" size={14} color="$muted" />
          <Text variant="caption" fontSize={13}>
            기본값으로 되돌리기
          </Text>
        </Box>
      </Pressable>
    </PickerSheet>
  );
});

export default WidgetStyleSheet;

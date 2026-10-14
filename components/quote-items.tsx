import { Box, Text } from "@/atom";
import { CARD_TEXT_COLORS, getCardBackground } from "@/data/card-backgrounds";
import { Quote } from "@/models";
import { useCardBackgroundStore } from "@/store/card-background";
import { toFontFamily, useFontStore } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import { LINE_HEIGHT_RATIO, MIN_QUOTE_FONT_SIZE, fitQuoteFontSize, shrinkToFit } from "@/utils/quote-font-size";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import ViewShot from "react-native-view-shot";
import FeatherIcon from "./icon";
import QuoteBar from "./quote-bar";

type Props = Quote & {
  // 사용자가 직접 작성한 명언이면 '나만의 명언' 라벨을 붙인다.
  isCustom?: boolean;
};

const QuoteItem: React.FC<Props> = ({ id, text, author, isCustom }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const { colors } = useThemeStore().currentTheme;
  const { currentFontId, currentFontSize } = useFontStore();
  const fontFamily = toFontFamily(currentFontId);
  // 카드 배경 이미지를 고르면 테마 색 대신 이미지 밝기에 맞춘 글씨 색을 쓴다.
  const background = getCardBackground(useCardBackgroundStore().currentBackgroundId);
  const imageColors = background.tone ? CARD_TEXT_COLORS[background.tone] : undefined;
  const foregroundColor = imageColors?.foreground ?? colors.$foreground;
  const mutedColor = imageColors?.muted ?? colors.$muted;
  const accentColor = imageColors?.foreground ?? colors.$primary;
  // Android에서는 굵기를 지정하면 그 굵기가 없는 폰트 대신 기본 폰트로 바뀐다.
  // 고른 폰트가 그대로 보이도록 굵기는 시스템 기본 폰트일 때만 준다.
  const isSystemFont = !fontFamily;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // 긴 명언은 카드가 화면을 넘지 않도록 글자 크기를 줄인다.
  // 먼저 글자 수로 어림하고, 그려진 뒤 실제 높이를 재서 카드 영역을 넘으면 한 번 더 줄인다.
  const estimatedSize = fitQuoteFontSize(text.length, currentFontSize, screenWidth, screenHeight);
  const [fontSize, setFontSize] = useState(estimatedSize);
  const availableHeight = useRef(0);
  const contentHeight = useRef(0);
  const textHeight = useRef(0);

  // 글자 크기 설정이나 화면이 바뀌면 어림값부터 다시 맞춘다.
  useEffect(() => setFontSize(estimatedSize), [estimatedSize]);

  const fitToArea = () => {
    if (!availableHeight.current || !contentHeight.current || !textHeight.current) return;
    if (contentHeight.current <= availableHeight.current || fontSize <= MIN_QUOTE_FONT_SIZE) return;
    const overflow = contentHeight.current - availableHeight.current;
    setFontSize(shrinkToFit(fontSize, textHeight.current, overflow));
  };

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      style={{ paddingHorizontal: 20 }}
      onLayout={(e) => {
        const height = e.nativeEvent.layout.height;
        // 영역이 넓어지면 (예: 광고가 사라짐) 어림값부터 다시 맞춘다.
        if (height > availableHeight.current + 1 && availableHeight.current > 0) setFontSize(estimatedSize);
        availableHeight.current = height;
        fitToArea();
      }}
    >
      <Box
        width="100%"
        alignItems="center"
        onLayout={(e) => {
          contentHeight.current = e.nativeEvent.layout.height;
          fitToArea();
        }}
      >
        {/* ViewShot 영역: 공유/저장 시 이 카드만 이미지로 캡처된다. */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1.0 }}
          style={{
            width: "100%",
            backgroundColor: colors.$surface,
            paddingHorizontal: 36,
            paddingTop: 28,
            paddingBottom: 22,
            borderRadius: 28,
            alignItems: "center",
            borderColor: colors.$border,
            borderWidth: 1,
            overflow: "hidden",
          }}
        >
          {background.source && (
            <>
              <Image source={background.source} resizeMode="cover" style={StyleSheet.absoluteFill} />
              {/* 글씨가 잘 읽히도록 살짝 덮는 막 */}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: imageColors?.scrim }]} />
            </>
          )}

          {isCustom ? (
            <Box
              flexDirection="row"
              alignItems="center"
              bg="$primarySoft"
              borderRadius="pill"
              px="md"
              style={{ gap: 5, paddingVertical: 5 }}
            >
              <FeatherIcon name="edit-2" size={12} color="$primary" />
              <Text color="$primary" fontSize={12} fontWeight="700">
                나만의 명언
              </Text>
            </Box>
          ) : (
            // 장식용 여는 따옴표
            <Text
              style={{
                color: accentColor,
                fontSize: 52,
                lineHeight: 52,
                height: 30,
                fontWeight: "900",
                fontFamily: "NanumMyeongjo_800ExtraBold",
              }}
            >
              {"“"}
            </Text>
          )}

          <Text
            fontSize={fontSize}
            fontWeight={isSystemFont ? "700" : undefined}
            textAlign="center"
            lineHeight={fontSize * LINE_HEIGHT_RATIO}
            style={{ letterSpacing: -0.4, fontFamily, marginTop: 16, color: foregroundColor }}
            onLayout={(e) => {
              textHeight.current = e.nativeEvent.layout.height;
            }}
          >
            {text}
          </Text>

          <Box
            width={24}
            height={2}
            borderRadius="pill"
            style={{ marginTop: 20, opacity: 0.7, backgroundColor: accentColor }}
          />

          <Text
            variant="caption"
            fontSize={15}
            fontWeight={isSystemFont ? "600" : undefined}
            textAlign="center"
            style={{ marginTop: 14, fontFamily, color: mutedColor }}
          >
            {author}
          </Text>

          {/* 저장·공유 이미지에 남는 워터마크 */}
          <Box flexDirection="row" alignItems="center" style={{ marginTop: 22, gap: 4, opacity: imageColors ? 0.6 : 0.4 }}>
            <Ionicons name="flame" size={11} color={mutedColor} />
            <Text fontSize={10} fontWeight="800" style={{ letterSpacing: 2.5, color: mutedColor }}>
              SELF FIRE
            </Text>
          </Box>
        </ViewShot>

        <QuoteBar id={id} text={text} author={author} viewShotRef={viewShotRef} />
      </Box>
    </Box>
  );
};

export default QuoteItem;

import { Box, Text } from "@/atom";
import { CARD_TEXT_COLORS, getCardBackground } from "@/data/card-backgrounds";
import { Quote } from "@/models";
import { useCardBackgroundStore } from "@/store/card-background";
import { toFontFamily, useFontStore } from "@/store/font-store";
import { useAppTheme } from "@/themes";
import { LINE_HEIGHT_RATIO, MIN_QUOTE_FONT_SIZE, fitQuoteFontSize, shrinkToFit } from "@/utils/quote-font-size";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";
import FeatherIcon from "./icon";
import QuoteBar from "./quote-bar";
import { useShallow } from "zustand/react/shallow";
import { QUOTE_MARK_FONT, useLoadedFont } from "@/utils/fonts";

type Props = Quote & {
  // 사용자가 직접 작성한 명언이면 '나만의 명언' 라벨을 붙인다.
  isCustom?: boolean;
  // 카드 바로 아래, 액션 바 위에 붙는 자리 (홈: 이 문장대로 한 일 한 줄). 공유 이미지에는 들어가지 않는다.
  footer?: React.ReactNode;
  // 오늘 따르기로 정한 명언이면 카드 위에 '오늘 따르는 문장' 표시를 붙인다. (공유 이미지에는 들어가지 않는다)
  isTodaysQuote?: boolean;
  // footer에 화면 폭 전체를 주고, 저장·공유 버튼은 그 아래 줄로 내린다. (오늘 따르는 문장 화면: 오늘의 한 줄이 주인공)
  footerStacked?: boolean;
  // footerStacked일 때 저장·공유 버튼 왼쪽에 둘 것 (예: 다른 문장으로 바꾸기)
  actionsLeading?: React.ReactNode;
};

const QuoteItem: React.FC<Props> = ({
  id,
  text,
  author,
  isCustom,
  footer,
  isTodaysQuote,
  footerStacked = false,
  actionsLeading,
}) => {
  const viewShotRef = useRef<ViewShot>(null);
  const { colors } = useAppTheme();
  const { currentFontId, currentFontSize } = useFontStore(
    useShallow((s) => ({
      currentFontId: s.currentFontId,
      currentFontSize: s.currentFontSize,
    }))
  );
  // 고른 폰트를 아직 불러오는 중이면 잠시 기본 폰트로 보여 준다.
  const fontFamily = useLoadedFont(toFontFamily(currentFontId));
  // 카드 배경 이미지를 고르면 테마 색 대신 이미지 밝기에 맞춘 글씨 색을 쓴다.
  const background = getCardBackground(useCardBackgroundStore((s) => s.currentBackgroundId));
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
        // 카드 위에 걸친 '오늘 따르는 문장' 표시가 잘리지 않도록 그만큼 비워 두고, 글자 크기 맞춤에도 넣어 센다.
        style={{ paddingTop: isTodaysQuote ? 14 : 0 }}
        onLayout={(e) => {
          contentHeight.current = e.nativeEvent.layout.height;
          fitToArea();
        }}
      >
        {/* 카드를 바탕에서 살짝 띄우는 그림자. 공유 이미지에는 들어가지 않도록 ViewShot 바깥에 둔다. */}
        <View style={[styles.cardShadow, { backgroundColor: colors.$surface }]}>
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
                <Text variant="label" color="$primary" fontSize={12}>
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
                  fontFamily: QUOTE_MARK_FONT,
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

            {/* 저장·공유 이미지에 남는 워터마크. 카드를 본 사람이 스토어에서 그대로 검색할 수 있게 한글 앱 이름을 쓴다 */}
            <Box flexDirection="row" alignItems="center" style={{ marginTop: 22, gap: 4, opacity: imageColors ? 0.8 : 0.65 }}>
              <Ionicons name="flame" size={13} color={mutedColor} />
              <Text fontSize={12} fontWeight="800" style={{ letterSpacing: 1, color: mutedColor }}>
                셀프파이어
              </Text>
            </Box>
          </ViewShot>

          {/* 카드 윗선에 걸쳐 놓아 자리를 차지하지 않는다 (긴 명언도 글자 크기를 그대로 쓸 수 있게) */}
          {isTodaysQuote && (
            <Box
              position="absolute"
              alignSelf="center"
              flexDirection="row"
              alignItems="center"
              bg="$flame"
              borderRadius="pill"
              px="md"
              style={{ top: -13, gap: 4, paddingVertical: 4 }}
              accessible
              accessibilityLabel="오늘 따르는 문장"
            >
              <Ionicons name="flame" size={12} color={colors.$onPrimary} />
              <Text color="$onPrimary" fontSize={12} fontWeight="800">
                오늘 따르는 문장
              </Text>
            </Box>
          )}
        </View>

        {footer && footerStacked ? (
          <Box width="100%" style={{ marginTop: 16, gap: 12 }}>
            {footer}
            <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
              <Box flex={1}>{actionsLeading}</Box>
              <QuoteBar id={id} text={text} author={author} viewShotRef={viewShotRef} inline />
            </Box>
          </Box>
        ) : footer ? (
          // 긴 명언도 카드가 들어갈 자리를 남기도록 footer와 저장·공유 버튼을 한 줄에 둔다.
          <Box width="100%" flexDirection="row" alignItems="center" style={{ marginTop: 16, gap: 8 }}>
            {/* 부모 Pan 제스처(스와이프)가 탭을 가로채지 않도록 감싼다 (quote-bar.tsx 참고) */}
            <NativeViewGestureHandler>
              <Box flex={1}>{footer}</Box>
            </NativeViewGestureHandler>
            <QuoteBar id={id} text={text} author={author} viewShotRef={viewShotRef} inline />
          </Box>
        ) : (
          <QuoteBar id={id} text={text} author={author} viewShotRef={viewShotRef} />
        )}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    width: "100%",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});

export default QuoteItem;

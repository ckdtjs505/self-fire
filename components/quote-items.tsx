import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { toFontFamily, useFontStore } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import { LINE_HEIGHT_RATIO, fitQuoteFontSize } from "@/utils/quote-font-size";
import { useRef } from "react";
import { useWindowDimensions } from "react-native";
import ViewShot from "react-native-view-shot";
import FeatherIcon, { Ionicon } from "./icon";
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
  // Android에서는 굵기를 지정하면 그 굵기가 없는 폰트 대신 기본 폰트로 바뀐다.
  // 고른 폰트가 그대로 보이도록 굵기는 시스템 기본 폰트일 때만 준다.
  const isSystemFont = !fontFamily;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // 긴 명언은 카드가 화면을 넘지 않도록 글자 크기를 줄인다.
  const fontSize = fitQuoteFontSize(text.length, currentFontSize, screenWidth, screenHeight);

  return (
    <Box flex={1} justifyContent="center" alignItems="center" style={{ paddingHorizontal: 20 }}>
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
        }}
      >
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
              color: colors.$primary,
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
          style={{ letterSpacing: -0.4, fontFamily, marginTop: 16 }}
        >
          {text}
        </Text>

        <Box width={24} height={2} borderRadius="pill" bg="$primary" style={{ marginTop: 20, opacity: 0.7 }} />

        <Text variant="caption" fontSize={15} fontWeight={isSystemFont ? "600" : undefined} textAlign="center" style={{ marginTop: 14, fontFamily }}>
          {author}
        </Text>

        {/* 저장·공유 이미지에 남는 워터마크 */}
        <Box flexDirection="row" alignItems="center" style={{ marginTop: 22, gap: 4, opacity: 0.4 }}>
          <Ionicon name="flame" size={11} color="$muted" />
          <Text color="$muted" fontSize={10} fontWeight="800" style={{ letterSpacing: 2.5 }}>
            SELF FIRE
          </Text>
        </Box>
      </ViewShot>

      <QuoteBar id={id} text={text} author={author} viewShotRef={viewShotRef} />
    </Box>
  );
};

export default QuoteItem;

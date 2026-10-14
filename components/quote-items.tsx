import { Box, Text } from "@/atom";
import { Quote } from "@/models";
import { toFontFamily, useFontStore } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import { useRef } from "react";
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

  return (
    <Box flex={1} justifyContent="center" alignItems="center" margin="lg">
      {isCustom && (
        <Box bg="$primary" px="md" py="xs" borderRadius="md" marginBottom="md" flexDirection="row" alignItems="center">
          <FeatherIcon name="edit-2" size={14} color="white" />
          <Text color="white" fontSize={12} fontWeight="bold" marginLeft="xs">
            나만의 명언
          </Text>
        </Box>
      )}

      {/* ViewShot 영역: 공유/저장 시 이 카드만 이미지로 캡처된다. */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1.0 }}
        style={{
          backgroundColor: colors.$sidebarBackground,
          padding: 40,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 320,
          borderColor: colors.$foreground + "15", // 옅은 테두리
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 8,
        }}
      >
        {/* 장식용 큰 따옴표 */}
        <Text
          style={{
            position: "absolute",
            top: 16,
            left: 24,
            fontSize: 80,
            opacity: 0.08,
            color: colors.$primary,
            fontWeight: "900",
          }}
        >
          "
        </Text>

        <Text
          fontSize={currentFontSize}
          fontWeight="heavy"
          textAlign="center"
          lineHeight={currentFontSize * 1.6}
          style={{ letterSpacing: -0.5, zIndex: 2, fontFamily }}
        >
          {text}
        </Text>
        <Text style={{ marginTop: 24, opacity: 0.7, fontWeight: "600", fontSize: 15, fontFamily }}>
          {author}
        </Text>
        <Text style={{ marginTop: 16, fontSize: 11, opacity: 0.4, letterSpacing: 2, fontWeight: "bold" }}>
          SELF-FIRE
        </Text>
      </ViewShot>

      <QuoteBar id={id} text={text} author={author} viewShotRef={viewShotRef} />
    </Box>
  );
};

export default QuoteItem;

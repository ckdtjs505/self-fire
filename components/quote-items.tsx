import { Box, Text } from "@/atom";
import Quotebar from "./quote-bar";
import FeatherIcon from "./icon";
import { useRef } from "react";
import ViewShot from "react-native-view-shot";
import { useThemeStore } from "@/store/theme";
import { useFontStore } from "@/store/font-store";

type Props = {
  text: string;
  author: string;
  id: string;
  isCustom?: boolean;
};

const QuoteItem: React.FC<Props> = ({ text, author, id, isCustom }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const { currentTheme } = useThemeStore();
  const { currentFontId, currentFontSize } = useFontStore();

  return (
    <Box flex={1} justifyContent={"center"} alignItems={"center"} margin={"lg"}>
      {isCustom && (
        <Box
          bg="$primary"
          px="md"
          py="xs"
          borderRadius="md"
          marginBottom="md"
          flexDirection="row"
          alignItems="center"
        >
          <FeatherIcon name="edit-2" size={14} color="white" />
          <Text color="white" fontSize={12} fontWeight="bold" marginLeft="xs">
            나만의 명언
          </Text>
        </Box>
      )}

      {/* ViewShot 영역: 이 부분만 이미지로 캡처 */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1.0 }}
        style={{
          backgroundColor: currentTheme.colors.$sidebarBackground,
          padding: 40,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 320,
          borderColor: currentTheme.colors.$foreground + '15', // Subtle border
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 8, // For Android
        }}
      >
        {/* 데코레이션 큰 따옴표 */}
        <Text style={{ position: 'absolute', top: 16, left: 24, fontSize: 80, opacity: 0.08, color: currentTheme.colors.$primary, fontWeight: '900' }}>
          "
        </Text>
        
        <Text
          fontSize={currentFontSize}
          fontWeight={"heavy"}
          textAlign={"center"}
          lineHeight={currentFontSize * 1.6}
          style={{ 
            letterSpacing: -0.5, 
            zIndex: 2, 
            fontFamily: currentFontId !== "system" ? currentFontId : undefined 
          }}
        >
          {text}
        </Text>
        <Text style={{ 
          marginTop: 24, 
          opacity: 0.7, 
          fontWeight: '600', 
          fontSize: 15,
          fontFamily: currentFontId !== "system" ? currentFontId : undefined 
        }}>
          {author}
        </Text>
        <Text style={{ marginTop: 16, fontSize: 11, opacity: 0.4, letterSpacing: 2, fontWeight: 'bold' }}>
          SELF-FIRE
        </Text>
      </ViewShot>

      <Quotebar id={id} text={text} author={author} viewShotRef={viewShotRef} />
    </Box>
  );
};

export default QuoteItem;

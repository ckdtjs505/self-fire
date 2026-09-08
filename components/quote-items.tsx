import { Box, Text } from "@/atom";
import Quotebar from "./quote-bar";
import FeatherIcon from "./icon";
import { useRef } from "react";
import ViewShot from "react-native-view-shot";
import { useThemeStore } from "@/store/theme";

type Props = {
  text: string;
  author: string;
  id: string;
  isCustom?: boolean;
};

const QuoteItem: React.FC<Props> = ({ text, author, id, isCustom }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const { currentTheme } = useThemeStore();

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
          backgroundColor: currentTheme.colors.$background,
          padding: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 300,
        }}
      >
        <Text
          fontSize={28}
          fontWeight={"heavy"}
          textAlign={"center"}
          lineHeight={40}
        >
          {text}
        </Text>
        <Text style={{ marginTop: 16, opacity: 0.6 }}>- {author} -</Text>
        <Text style={{ marginTop: 12, fontSize: 12, opacity: 0.4 }}>
          🔥 Self-Fire
        </Text>
      </ViewShot>

      <Quotebar id={id} text={text} author={author} viewShotRef={viewShotRef} />
    </Box>
  );
};

export default QuoteItem;

// ─────────────────────────────────────────────────────────────
// share-sheet.tsx — 명언 공유하기
// 명언 카드 아래 공유 버튼을 누르면 여는 바텀시트.
//   - 이미지로 공유: 카드를 PNG로 캡처해 시스템 공유 창으로 보낸다 (인스타그램 스토리·카카오톡 등)
//   - 텍스트로 공유 / 텍스트 복사 / 이미지 저장(갤러리)
// RN Share는 Android에서 이미지(url)를 무시하므로 이미지 공유는 expo-sharing을 쓴다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { trackEvent } from "@/utils/analytics";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, Share } from "react-native";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import FeatherIcon, { IconNames } from "./icon";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";

type Props = {
  // 공유할 텍스트 (본문 - 작가)
  text: string;
  // 이미지로 캡처할 명언 카드
  viewShotRef?: React.RefObject<ViewShot | null>;
};

type ShareMethod = "image" | "text" | "copy" | "save";

const OPTIONS: { method: ShareMethod; icon: IconNames; title: string; description: string }[] = [
  { method: "image", icon: "image", title: "이미지로 공유", description: "인스타그램 스토리, 카카오톡 등으로 카드 그대로 보내요" },
  { method: "text", icon: "message-circle", title: "텍스트로 공유", description: "명언 글만 보내요" },
  { method: "copy", icon: "copy", title: "텍스트 복사", description: "어디든 붙여 넣을 수 있게 복사해요" },
  { method: "save", icon: "download", title: "이미지 저장", description: "갤러리에 카드 이미지를 저장해요" },
];

const ShareSheet = forwardRef<PickerSheetHandle, Props>(function ShareSheet({ text, viewShotRef }, ref) {
  const sheetRef = useRef<PickerSheetHandle>(null);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  const capture = async () => {
    const uri = await viewShotRef?.current?.capture?.();
    if (!uri) throw new Error("capture failed");
    return uri;
  };

  const shareText = () => Share.share({ message: text });

  const run = async (method: ShareMethod) => {
    sheetRef.current?.close();
    try {
      switch (method) {
        case "image": {
          // 이미지 공유를 못 하는 환경이면 텍스트로 대신 공유한다.
          if (!(await Sharing.isAvailableAsync())) {
            await shareText();
            break;
          }
          await Sharing.shareAsync(await capture(), { mimeType: "image/png", dialogTitle: "명언 공유" });
          break;
        }
        case "text":
          await shareText();
          break;
        case "copy":
          await Clipboard.setStringAsync(text);
          Toast.show({ type: "success", text2: "명언을 복사했어요" });
          break;
        case "save": {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== "granted") {
            Toast.show({ type: "error", text2: "갤러리에 저장하려면 사진 접근을 허용해 주세요" });
            return;
          }
          await MediaLibrary.saveToLibraryAsync(await capture());
          Toast.show({ type: "success", text2: "갤러리에 이미지를 저장했어요" });
          break;
        }
      }
      trackEvent("quote_share", { method });
    } catch (e) {
      Toast.show({ type: "error", text2: method === "save" ? "이미지를 저장하지 못했어요. 다시 시도해 주세요" : "공유하지 못했어요. 다시 시도해 주세요" });
      console.error(e);
    }
  };

  return (
    <PickerSheet ref={sheetRef} title="공유하기">
      <Box gap="xs">
        {OPTIONS.map((option) => (
          <Pressable
            key={option.method}
            onPress={() => run(option.method)}
            accessibilityRole="button"
            accessibilityLabel={option.title}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Box flexDirection="row" alignItems="center" py="md" style={{ gap: 14 }}>
              <Box
                width={44}
                height={44}
                borderRadius="pill"
                bg="$surfaceMuted"
                justifyContent="center"
                alignItems="center"
              >
                <FeatherIcon name={option.icon} size={19} />
              </Box>
              <Box flex={1} style={{ gap: 2 }}>
                <Text fontSize={16} fontWeight="700">
                  {option.title}
                </Text>
                <Text variant="caption" fontSize={13}>
                  {option.description}
                </Text>
              </Box>
            </Box>
          </Pressable>
        ))}
      </Box>
    </PickerSheet>
  );
});

export default ShareSheet;

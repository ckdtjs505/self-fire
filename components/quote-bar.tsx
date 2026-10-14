// ─────────────────────────────────────────────────────────────
// quote-bar.tsx
// 명언 카드 아래 액션 바: 공유 / 갤러리 저장 / 불씨 보관함 토글
//
// ⚠️ NativeViewGestureHandler로 감싸서, 부모 PanGestureHandler(스와이프)가
//    이 영역의 버튼 탭을 스와이프로 오인하지 않도록 한다.
//    같은 이유로 Pressable도 react-native-gesture-handler 것을 사용한다.
// ─────────────────────────────────────────────────────────────

import { Box } from "@/atom";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import * as MediaLibrary from "expo-media-library";
import { NativeViewGestureHandler, Pressable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import FeatherIcon, { Ionicon } from "./icon";
import ShareButton from "./share-button";

const HIT_SLOP = 12;

type Props = Quote & {
  // 이미지 캡처 대상 카드
  viewShotRef?: React.RefObject<ViewShot | null>;
};

const QuoteBar: React.FC<Props> = ({ id, text, author, viewShotRef }) => {
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore();
  const isFavorite = favorites.includes(id);

  // 현재 명언 카드를 PNG로 캡처해 갤러리에 저장한다.
  const handleSaveImage = async () => {
    if (!viewShotRef?.current?.capture) {
      Toast.show({ type: "error", text1: "오류", text2: "이미지를 캡처할 수 없습니다." });
      return;
    }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: "error", text1: "권한 필요", text2: "갤러리 저장을 위해 사진 접근 권한이 필요합니다." });
        return;
      }
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({ type: "success", text1: "저장 완료 ✅", text2: "명언 이미지가 갤러리에 저장되었습니다!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "오류", text2: "이미지 저장에 실패했습니다." });
      console.error(e);
    }
  };

  // 불씨 보관함 추가/제거. 사이드바에서 바로 보여줄 수 있게 명언 내용도 함께 저장한다.
  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(id);
      Toast.show({ type: "info", text1: "불씨가 꺼졌습니다" });
    } else {
      addFavorite(id, { id, text, author });
      Toast.show({ type: "success", text1: "불씨 보관함에 저장되었습니다 🔥" });
    }
  };

  return (
    <NativeViewGestureHandler>
      <Box
        m="md"
        p="xs"
        height={44}
        width={140}
        justifyContent="space-around"
        borderRadius="lg"
        alignItems="center"
        backgroundColor="$headerBackground"
        flexDirection="row"
      >
        <ShareButton text={`${text} -${author}`} viewShotRef={viewShotRef} />

        <Pressable onPress={handleSaveImage} hitSlop={HIT_SLOP}>
          <FeatherIcon name="download" size={24} />
        </Pressable>

        <Pressable onPress={toggleFavorite} hitSlop={HIT_SLOP}>
          {isFavorite ? (
            <Ionicon name="flame" size={24} color="red" />
          ) : (
            <Ionicon name="flame-outline" size={24} />
          )}
        </Pressable>
      </Box>
    </NativeViewGestureHandler>
  );
};

export default QuoteBar;

// ─────────────────────────────────────────────────────────────
// quote-bar.tsx
// 명언 카드 아래 액션 바: 공유(이미지·텍스트·복사·저장 시트) / 불씨 보관함 토글
//
// ⚠️ NativeViewGestureHandler로 감싸서, 부모 PanGestureHandler(스와이프)가
//    이 영역의 버튼 탭을 스와이프로 오인하지 않도록 한다.
//    같은 이유로 Pressable도 react-native-gesture-handler 것을 사용한다.
// ─────────────────────────────────────────────────────────────

import { Box } from "@/atom";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { trackEvent } from "@/utils/analytics";
import { tapHaptic } from "@/utils/haptics";
import { useRef } from "react";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import ActionButton from "./action-button";
import FeatherIcon, { Ionicon } from "./icon";
import { PickerSheetHandle } from "./picker-sheet";
import ShareSheet from "./share-sheet";

type Props = Quote & {
  // 이미지 캡처 대상 카드
  viewShotRef?: React.RefObject<ViewShot | null>;
};

const QuoteBar: React.FC<Props> = ({ id, text, author, viewShotRef }) => {
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore();
  const isFavorite = favorites.includes(id);
  const shareSheetRef = useRef<PickerSheetHandle>(null);

  // 불씨 보관함 추가/제거. 사이드바에서 바로 보여줄 수 있게 명언 내용도 함께 저장한다.
  // 실수로 꺼도 토스트의 '되돌리기'로 바로 다시 보관할 수 있다.
  const toggleFavorite = () => {
    tapHaptic();
    if (isFavorite) {
      removeFavorite(id);
      trackEvent("favorite_remove");
      Toast.show({
        type: "undo",
        text1: "불씨가 꺼졌습니다",
        props: {
          onUndo: () => {
            addFavorite(id, { id, text, author });
            trackEvent("favorite_undo");
            Toast.hide();
          },
        },
      });
    } else {
      addFavorite(id, { id, text, author });
      trackEvent("favorite_add");
      Toast.show({ type: "success", text1: "불씨 보관함에 저장되었습니다 🔥" });
    }
  };

  return (
    <>
      <NativeViewGestureHandler>
        <Box flexDirection="row" justifyContent="center" style={{ gap: 28, marginTop: 20 }}>
          <ActionButton label="공유" onPress={() => shareSheetRef.current?.open()}>
            <FeatherIcon name="share" size={20} />
          </ActionButton>

          <ActionButton label={isFavorite ? "보관됨" : "불씨"} onPress={toggleFavorite} active={isFavorite}>
            <Ionicon name={isFavorite ? "flame" : "flame-outline"} size={22} color={isFavorite ? "white" : "$foreground"} />
          </ActionButton>
        </Box>
      </NativeViewGestureHandler>
      {/* NativeViewGestureHandler는 자식 하나만 받으므로 시트는 밖에 둔다. */}
      <ShareSheet ref={shareSheetRef} text={`${text} -${author}`} viewShotRef={viewShotRef} />
    </>
  );
};

export default QuoteBar;

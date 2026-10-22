// ─────────────────────────────────────────────────────────────
// quote-bar.tsx
// 명언 카드 아래 액션 바: 공유(이미지·텍스트·복사·저장 시트) / 저장한 문장 토글
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
import { useRouter } from "expo-router";
import { useRef } from "react";
import { NativeViewGestureHandler } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import ActionButton from "./action-button";
import FeatherIcon, { Ionicon } from "./icon";
import { PickerSheetHandle } from "./picker-sheet";
import ShareSheet from "./share-sheet";
import { useShallow } from "zustand/react/shallow";

type Props = Quote & {
  // 이미지 캡처 대상 카드
  viewShotRef?: React.RefObject<ViewShot | null>;
  // 다른 버튼(홈: 이 문장대로 한 일)과 한 줄에 나란히 놓을 때: 위 여백 없이 촘촘하게
  inline?: boolean;
};

const QuoteBar: React.FC<Props> = ({ id, text, author, viewShotRef, inline = false }) => {
  const router = useRouter();
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore(
    useShallow((s) => ({
      addFavorite: s.addFavorite,
      removeFavorite: s.removeFavorite,
      favorites: s.favorites,
    }))
  );
  const isFavorite = favorites.includes(id);
  const shareSheetRef = useRef<PickerSheetHandle>(null);

  // 저장한 문장 추가/제거. 사이드바에서 바로 보여줄 수 있게 명언 내용도 함께 저장한다.
  // 실수로 꺼도 토스트의 '되돌리기'로 바로 다시 저장할 수 있다.
  const toggleFavorite = () => {
    tapHaptic();
    if (isFavorite) {
      removeFavorite(id);
      trackEvent("favorite_remove");
      Toast.show({
        type: "undo",
        text1: "저장을 취소했어요",
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
      // 저장 버튼이 채워져 결과는 보이지만, 모아 둔 곳으로 바로 갈 수 있게 '보기'를 붙인다. (Instagram 저장과 같은 방식)
      Toast.show({
        type: "success",
        text1: "저장한 문장에 담았어요",
        props: {
          action: {
            label: "보기",
            onPress: () => {
              Toast.hide();
              router.push("/favorites");
            },
          },
        },
      });
    }
  };

  return (
    <>
      <NativeViewGestureHandler>
        <Box flexDirection="row" justifyContent="center" style={inline ? { gap: 8 } : { gap: 28, marginTop: 20 }}>
          <ActionButton label="공유" onPress={() => shareSheetRef.current?.open()}>
            <FeatherIcon name="share" size={20} />
          </ActionButton>

          <ActionButton label={isFavorite ? "저장됨" : "저장"} onPress={toggleFavorite} active={isFavorite}>
            <Ionicon name={isFavorite ? "bookmark" : "bookmark-outline"} size={21} color="$foreground" />
          </ActionButton>
        </Box>
      </NativeViewGestureHandler>
      {/* NativeViewGestureHandler는 자식 하나만 받으므로 시트는 밖에 둔다. */}
      <ShareSheet ref={shareSheetRef} text={`${text} -${author}`} viewShotRef={viewShotRef} />
    </>
  );
};

export default QuoteBar;

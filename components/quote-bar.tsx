// ─────────────────────────────────────────────────────────────
// quote-bar.tsx
// 명언 카드 하단에 표시되는 액션 바 컴포넌트.
// - 공유 버튼 (ShareButton)
// - 갤러리 저장 버튼 (이미지 캡처 → 미디어 라이브러리 저장)
// - 즐겨찾기 추가/제거 버튼 (하트 아이콘 토글)
// ─────────────────────────────────────────────────────────────

import { Box } from "@/atom";
import FeatherIcon from "./icon";
import ShareButton from "./share-button";
import { Alert, Pressable } from "react-native";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Quote } from "@/models";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import Toast from 'react-native-toast-message';

// ── Props 타입 ────────────────────────────────────────────────
// Quote 모델의 모든 필드를 상속하고,
// 이미지 캡처를 위한 ViewShot ref를 추가로 받는다.
type Props = Quote & {
  viewShotRef?: React.RefObject<ViewShot>;
};

const Quotebar: React.FC<Props> = (props) => {
  // 즐겨찾기 추가/제거 함수와 현재 즐겨찾기 ID 목록을 가져온다.
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore();
  const { id, text, author, viewShotRef } = props;

  // ── handleSaveImage ───────────────────────────────────────
  // 현재 명언 카드를 이미지로 캡처하여 기기 갤러리에 저장한다.
  // 1) ViewShot ref 유효성 확인
  // 2) 미디어 라이브러리 접근 권한 요청
  // 3) 캡처 → 저장 → 성공/실패 토스트 표시
  const handleSaveImage = async () => {
    // ViewShot ref가 없으면 캡처 불가
    if (!viewShotRef?.current) {
      Toast.show({ type: 'error', text1: '오류', text2: '이미지를 캡처할 수 없습니다.' });
      return;
    }
    try {
      // 갤러리 저장을 위한 미디어 접근 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: 'error', text1: '권한 필요', text2: '갤러리 저장을 위해 사진 접근 권한이 필요합니다.' });
        return;
      }
      // ViewShot으로 현재 뷰를 PNG로 캡처
      const uri = await (viewShotRef.current as any).capture();
      // 캡처한 이미지를 미디어 라이브러리(갤러리)에 저장
      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({ type: 'success', text1: '저장 완료 ✅', text2: '명언 이미지가 갤러리에 저장되었습니다!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: '오류', text2: '이미지 저장에 실패했습니다.' });
      console.error(e);
    }
  };

  return (
    // 액션 바 컨테이너: 가로로 아이콘 3개를 일정 간격으로 배치
    <Box
      m="md"
      p="xs"
      height={44}
      width={140}
      justifyContent={"space-around"}
      borderRadius={"lg"}
      alignItems={"center"}
      backgroundColor={"$headerBackground"}
      flexDirection={"row"}
    >
      {/* 공유 버튼: 텍스트 공유 + 이미지 공유 기능 포함 */}
      <ShareButton text={`${text} -${author}`} viewShotRef={viewShotRef} />

      {/* 갤러리 저장 버튼 */}
      <Pressable onPress={handleSaveImage}>
        <FeatherIcon name="download" size={24} />
      </Pressable>

      {/* 즐겨찾기 토글 버튼
          - 즐겨찾기에 없으면: 빈 하트 → 클릭 시 추가
          - 즐겨찾기에 있으면: 빨간 하트 → 클릭 시 제거 */}
      {!favorites.includes(id) ? (
        <Pressable
          onPress={() => {
            addFavorite(id);
            Toast.show({ type: 'success', text1: '저장되었습니다' });
          }}
        >
          <FeatherIcon name="heart" size={24} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => {
            removeFavorite(id);
            Toast.show({ type: 'info', text1: '삭제되었습니다' });
          }}
        >
          <FeatherIcon color={"red"} name="heart" size={24} />
        </Pressable>
      )}
    </Box>
  );
};
export default Quotebar;

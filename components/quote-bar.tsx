// ─────────────────────────────────────────────────────────────
// quote-bar.tsx
// 명언 카드 하단에 표시되는 액션 바 컴포넌트.
//
// 구성 버튼 (왼쪽 → 오른쪽):
//   1. 공유 버튼     : 텍스트/이미지 공유 (ShareButton)
//   2. 저장 버튼     : 명언 카드를 이미지로 캡처하여 갤러리 저장
//   3. 불씨 보관함   : 불씨 아이콘 탭으로 명언 저장/제거 토글
//
// ⚠️ NativeViewGestureHandler로 감싸져 있음.
//    부모 PanGestureHandler(스와이프 제스처)가 이 영역의 터치를
//    스와이프로 오인하지 않도록 명시적으로 구분 처리.
// ─────────────────────────────────────────────────────────────

import { Box } from "@/atom";
import FeatherIcon, { Ionicon } from "./icon";
import ShareButton from "./share-button";
import { Alert } from "react-native";
// react-native-gesture-handler의 Pressable을 사용해야
// 부모 PanGestureHandler와 제스처 시스템이 충돌하지 않음
import { Pressable, NativeViewGestureHandler } from "react-native-gesture-handler";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Quote } from "@/models";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import Toast from 'react-native-toast-message';

// ── Props 타입 ────────────────────────────────────────────────
// Quote 모델의 id, text, author 필드를 상속하고,
// 이미지 캡처를 위한 ViewShot ref를 추가로 받는다.
type Props = Quote & {
  viewShotRef?: React.RefObject<ViewShot>;
};

const Quotebar: React.FC<Props> = (props) => {
  // 불씨 보관함 스토어에서 추가/제거 함수 및 저장된 ID 목록을 가져온다.
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore();
  const { id, text, author, viewShotRef } = props;

  // ── handleSaveImage ───────────────────────────────────────
  // 현재 명언 카드를 이미지로 캡처하여 기기 갤러리에 저장한다.
  // 처리 순서:
  //   1) ViewShot ref 유효성 확인 (없으면 오류 토스트 후 중단)
  //   2) 미디어 라이브러리 접근 권한 요청 (거부 시 중단)
  //   3) ViewShot으로 현재 카드 뷰를 PNG 이미지로 캡처
  //   4) 캡처된 URI를 갤러리(미디어 라이브러리)에 저장
  //   5) 성공/실패 결과를 Toast로 사용자에게 알림
  const handleSaveImage = async () => {
    // ViewShot ref가 없으면 캡처 불가 → 오류 안내 후 종료
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
      // ViewShot으로 현재 카드 뷰를 PNG로 캡처
      const uri = await (viewShotRef.current as any).capture();
      // 캡처된 이미지를 미디어 라이브러리(갤러리)에 저장
      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({ type: 'success', text1: '저장 완료 ✅', text2: '명언 이미지가 갤러리에 저장되었습니다!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: '오류', text2: '이미지 저장에 실패했습니다.' });
      console.error(e);
    }
  };

  return (
    // NativeViewGestureHandler: 버튼 영역을 부모 PanGestureHandler로부터 보호.
    // 이 안에서 발생한 터치는 스와이프 제스처로 전파되지 않고 버튼 탭으로 처리됨.
    <NativeViewGestureHandler>
      {/* 액션 바 컨테이너: 버튼 3개를 가로로 균등 배치 */}
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
        {/* ① 공유 버튼: 텍스트 + 이미지 카드 공유 기능 포함 */}
        <ShareButton text={`${text} -${author}`} viewShotRef={viewShotRef} />

        {/* ② 갤러리 저장 버튼: 명언 카드를 이미지로 캡처하여 기기에 저장
            hitSlop으로 탭 영역을 주변 12px까지 확장 */}
        <Pressable onPress={handleSaveImage} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <FeatherIcon name="download" size={24} />
        </Pressable>

        {/* ③ 불씨 보관함 토글 버튼
            - 저장 안 된 상태: flame-outline (빈 불씨) → 탭 시 보관함에 추가
            - 저장된 상태: flame (빨간 불씨) → 탭 시 보관함에서 제거
            저장 시 명언 객체(id, text, author)를 함께 보관하여 사이드바에서 바로 표시 가능 */}
        {!favorites.includes(id) ? (
          // 보관함에 없음 → 빈 불씨 아이콘
          <Pressable
            onPress={() => {
              addFavorite(id, { id, text, author }); // 명언 내용까지 함께 저장
              Toast.show({ type: 'success', text1: '불씨 보관함에 저장되었습니다 🔥' });
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicon name="flame-outline" size={24} />
          </Pressable>
        ) : (
          // 보관함에 있음 → 채워진 빨간 불씨 아이콘
          <Pressable
            onPress={() => {
              removeFavorite(id); // 보관함에서 제거
              Toast.show({ type: 'info', text1: '불씨가 꺼졌습니다' });
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicon color={"red"} name="flame" size={24} />
          </Pressable>
        )}
      </Box>
    </NativeViewGestureHandler>
  );
};
export default Quotebar;

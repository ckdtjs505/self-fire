import { Box } from "@/atom";
import FeatherIcon from "./icon";
import ShareButton from "./share-button";
import { Alert, Pressable } from "react-native";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Quote } from "@/models";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import Toast from 'react-native-toast-message';

type Props = Quote & {
  viewShotRef?: React.RefObject<ViewShot>;
};

const Quotebar: React.FC<Props> = (props) => {
  const { addFavorite, removeFavorite, favorites } = useFavoriteQuoteStore();
  const { id, text, author, viewShotRef } = props;

  const handleSaveImage = async () => {
    if (!viewShotRef?.current) {
      Toast.show({ type: 'error', text1: '오류', text2: '이미지를 캡처할 수 없습니다.' });
      return;
    }
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: 'error', text1: '권한 필요', text2: '갤러리 저장을 위해 사진 접근 권한이 필요합니다.' });
        return;
      }
      const uri = await (viewShotRef.current as any).capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({ type: 'success', text1: '저장 완료 ✅', text2: '명언 이미지가 갤러리에 저장되었습니다!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: '오류', text2: '이미지 저장에 실패했습니다.' });
      console.error(e);
    }
  };

  return (
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
      <ShareButton text={`${text} -${author}`} viewShotRef={viewShotRef} />

      {/* 갤러리 저장 버튼 */}
      <Pressable onPress={handleSaveImage}>
        <FeatherIcon name="download" size={24} />
      </Pressable>

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

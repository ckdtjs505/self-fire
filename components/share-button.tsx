import FeatherIcon from "./icon";
import { Pressable, Share } from "react-native";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";

type Props = {
  text: string;
  viewShotRef?: React.RefObject<ViewShot>;
};

const ShareButton: React.FC<Props> = ({ text, viewShotRef }) => {
  const handleShare = async () => {
    if (viewShotRef?.current) {
      try {
        // ViewShot으로 이미지 캡처 후 공유
        const uri = await (viewShotRef.current as any).capture();
        await Share.share({ url: uri, message: text });
      } catch (e) {
        // 실패 시 텍스트 공유로 폴백
        await Share.share({ message: text });
      }
    } else {
      await Share.share({ message: text });
    }
  };

  return (
    <Pressable onPress={handleShare}>
      <FeatherIcon name="share" size={24} />
    </Pressable>
  );
};

export default ShareButton;

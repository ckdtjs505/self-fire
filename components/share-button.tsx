import FeatherIcon from "./icon";
import { Share } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";

type Props = {
  text: string;
  viewShotRef?: React.RefObject<ViewShot | null>;
};

// 명언 카드를 이미지로 캡처해 텍스트와 함께 공유한다. 캡처 실패 시 텍스트만 공유한다.
const ShareButton: React.FC<Props> = ({ text, viewShotRef }) => {
  const handleShare = async () => {
    try {
      const uri = await viewShotRef?.current?.capture?.();
      if (uri) {
        await Share.share({ url: uri, message: text });
        return;
      }
    } catch (e) {
      // 아래에서 텍스트 공유로 대체
    }
    await Share.share({ message: text });
  };

  return (
    <Pressable onPress={handleShare} hitSlop={12}>
      <FeatherIcon name="share" size={24} />
    </Pressable>
  );
};

export default ShareButton;

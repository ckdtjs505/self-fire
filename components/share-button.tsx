import { Share } from "react-native";
import ViewShot from "react-native-view-shot";
import ActionButton from "./action-button";
import FeatherIcon from "./icon";

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
    } catch {
      // 아래에서 텍스트 공유로 대체
    }
    await Share.share({ message: text });
  };

  return (
    <ActionButton label="공유" onPress={handleShare}>
      <FeatherIcon name="share" size={20} />
    </ActionButton>
  );
};

export default ShareButton;

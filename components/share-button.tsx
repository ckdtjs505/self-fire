import FeatherIcon from "./icon";
import { Pressable, Share } from "react-native";

type Props = {
  text: string;
};
const ShareButton: React.FC<Props> = ({ text }) => {
  const handleShare = async () => {
    await Share.share({
      message: text,
    });
  };

  return (
    <Pressable onPress={handleShare}>
      <FeatherIcon name="share" size={24} />
    </Pressable>
  );
};

export default ShareButton;

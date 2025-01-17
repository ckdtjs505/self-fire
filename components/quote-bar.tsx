import { Box } from "@/atom";
import FeatherIcon from "./icon";
import ShareButton from "./share-button";
type Props = {
  text: string;
  author: string;
};

const Quotebar: React.FC<Props> = ({ text, author }) => {
  return (
    <Box
      m="md"
      p="xs"
      height={44}
      width={100}
      justifyContent={"space-around"}
      borderRadius={"lg"}
      alignItems={"center"}
      backgroundColor={"$headerBackground"}
      flexDirection={"row"}
    >
      <ShareButton text={`${text} -${author}`}></ShareButton>
      <FeatherIcon name="heart" size={24}></FeatherIcon>
    </Box>
  );
};
export default Quotebar;

import { Box } from "@/atom";
import FeatherIcon from "./icon";
const Quotebar: React.FC = () => {
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
      <FeatherIcon name="share" size={24}></FeatherIcon>
      <FeatherIcon name="heart" size={24}></FeatherIcon>
    </Box>
  );
};
export default Quotebar;

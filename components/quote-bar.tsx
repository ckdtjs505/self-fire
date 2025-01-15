import { Box } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";
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
      <MaterialIcons color={"#171a21"} name="share" size={24}></MaterialIcons>
      <MaterialIcons
        color={"#171a21"}
        name="bookmark-add"
        size={24}
      ></MaterialIcons>
    </Box>
  );
};
export default Quotebar;

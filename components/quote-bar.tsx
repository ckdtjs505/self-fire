import { Box } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";
const Quotebar: React.FC = () => {
  return (
    <Box
      m="md"
      p="xs"
      height={60}
      width={200}
      justifyContent={"space-around"}
      borderRadius={"lg"}
      alignItems={"center"}
      backgroundColor={"$headerBackground"}
      flexDirection={"row"}
    >
      <MaterialIcons color={"#171a21"} name="image" size={32}></MaterialIcons>
      <MaterialIcons color={"#171a21"} name="share" size={32}></MaterialIcons>
      <MaterialIcons
        color={"#171a21"}
        name="bookmark-add"
        size={32}
      ></MaterialIcons>
      <MaterialIcons
        color={"#171a21"}
        name="settings"
        size={32}
      ></MaterialIcons>
    </Box>
  );
};
export default Quotebar;

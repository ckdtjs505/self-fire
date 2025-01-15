import { Box } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";
const HeaderRight: React.FC = () => {
  return (
    <Box
      position={"absolute"}
      top={0}
      right={0}
      m="s"
      p="xs"
      minHeight={44}
      width={100}
      justifyContent={"space-between"}
      alignItems={"center"}
      flexDirection={"row"}
    >
      <Box
        borderRadius={"hg"}
        borderWidth={1}
        width={40}
        height={40}
        justifyContent={"center"}
        flexDirection={"column"}
        alignContent={"center"}
        alignItems={"center"}
      >
        <MaterialIcons color={"#171a21"} name="image" size={24}></MaterialIcons>
      </Box>
      <Box
        borderRadius={"hg"}
        borderWidth={1}
        width={40}
        height={40}
        justifyContent={"center"}
        flexDirection={"column"}
        alignContent={"center"}
        alignItems={"center"}
      >
        <MaterialIcons
          color={"#171a21"}
          name="settings"
          size={24}
        ></MaterialIcons>
      </Box>
    </Box>
  );
};
export default HeaderRight;

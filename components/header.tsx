import { Box, Text } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {};
const Header: React.FC<Props> = () => {
  return (
    <Box
      position={"absolute"}
      top={0}
      left={0}
      right={0}
      height={60}
      minHeight={44}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDirection={"row"}
    >
      <Box m="xs" p="xs">
        <MaterialIcons name="menu" size={24}></MaterialIcons>
      </Box>
      <Box
        m="xs"
        p="xs"
        flexDirection={"row"}
        width={130}
        backgroundColor={"$headerBackground"}
        justifyContent={"space-around"}
        borderRadius={"lg"}
      >
        <MaterialIcons name="edit" size={24}></MaterialIcons>
        <MaterialIcons name="share" size={24}></MaterialIcons>
        <MaterialIcons name="bookmark" size={24}></MaterialIcons>
        <MaterialIcons name="settings" size={24}></MaterialIcons>
      </Box>
    </Box>
  );
};

export default Header;

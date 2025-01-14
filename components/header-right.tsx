import { Box } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";
const HeaderRight: React.FC = () => {
  return (
    <Box
      position={"absolute"}
      right={0}
      top={0}
      m="md"
      p="xs"
      height={230}
      width={60}
      justifyContent={"space-around"}
      borderRadius={"lg"}
      alignItems={"center"}
      backgroundColor={"$headerBackground"}
      flexDirection={"column"}
    >
      <MaterialIcons name="image" size={32}></MaterialIcons>
      <MaterialIcons name="share" size={32}></MaterialIcons>
      <MaterialIcons name="bookmark-add" size={32}></MaterialIcons>
      <MaterialIcons name="settings" size={32}></MaterialIcons>
    </Box>
  );
};
export default HeaderRight;

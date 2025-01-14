import { Box, Text } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {};
const HeaderLeft: React.FC<Props> = () => {
  return (
    <Box
      position={"absolute"}
      top={0}
      left={0}
      right={0}
      minHeight={44}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDirection={"row"}
    >
      <Box m="md" p="xs">
        <MaterialIcons name="menu" size={32}></MaterialIcons>
      </Box>
    </Box>
  );
};

export default HeaderLeft;

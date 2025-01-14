import { View } from "react-native";
import Box from "@/atom/box";
import Text from "@/atom/text";
type Props = {};
const Sidebar: React.FC<Props> = () => {
  return (
    <Box
      flex={1}
      backgroundColor={"$sidebarBackground"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <View>
        <Text>Sidebar</Text>
      </View>
    </Box>
  );
};

export default Sidebar;

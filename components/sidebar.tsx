import { Box, Text } from "@/atom";
import { View } from "react-native";
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

import { createBox, createText } from "@shopify/restyle";
import { Theme } from "@/themes/light";
import { View } from "react-native";
const Box = createBox<Theme>();
const Text = createText<Theme>();
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

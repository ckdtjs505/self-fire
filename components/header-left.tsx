import { Box } from "@/atom";
import { MaterialIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";

type Props = {};
const HeaderLeft: React.FC<Props> = () => {
  const navigation = useNavigation();
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
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      >
        <Box m="md" p="xs">
          <MaterialIcons name="menu" size={32}></MaterialIcons>
        </Box>
      </Pressable>
    </Box>
  );
};

export default HeaderLeft;

import { Box } from "@/atom";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";
import FeatherIcon from "./icon";

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
      zIndex={10}
    >
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      >
        <Box m="md" p="xs">
          <FeatherIcon name="menu" size={22}></FeatherIcon>
        </Box>
      </Pressable>
    </Box>
  );
};

export default HeaderLeft;

import { Box } from "@/atom";
import FeatherIcon from "./icon";
import { Pressable } from "react-native-gesture-handler";
import { router } from "expo-router";
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
      <Pressable
        onPress={ ()=> router.push('/ThemesScreen') }
      >
        <Box
          borderRadius={"hg"}
          borderWidth={1}
          borderColor={"$foreground"}
          width={40}
          height={40}
          justifyContent={"center"}
          flexDirection={"column"}
          alignContent={"center"}
          alignItems={"center"}
        >
          <FeatherIcon name="image" size={22}></FeatherIcon>
        </Box>
      </Pressable>
      <Box
        borderRadius={"hg"}
        borderWidth={1}
        borderColor={"$foreground"}
        width={40}
        height={40}
        justifyContent={"center"}
        flexDirection={"column"}
        alignContent={"center"}
        alignItems={"center"}
      >
        <FeatherIcon name="settings" size={22}></FeatherIcon>
      </Box>
    </Box>
  );
};
export default HeaderRight;

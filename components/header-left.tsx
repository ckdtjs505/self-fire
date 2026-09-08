import { Box } from "@/atom";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";
import FeatherIcon from "./icon";
import React from "react";

type Props = {
  children?: React.ReactNode;
};

const HeaderLeft: React.FC<Props> = ({ children }) => {
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
      <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Box m="md" p="xs">
            <FeatherIcon name="menu" size={22}></FeatherIcon>
          </Box>
        </Pressable>
        {children}
      </Box>
    </Box>
  );
};

export default HeaderLeft;

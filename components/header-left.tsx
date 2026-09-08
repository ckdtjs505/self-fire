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
          <Box 
            m="md" 
            width={40} 
            height={40} 
            borderRadius="hg" 
            justifyContent="center" 
            alignItems="center"
            backgroundColor="$sidebarBackground"
            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          >
            <FeatherIcon name="menu" size={20}></FeatherIcon>
          </Box>
        </Pressable>
        {children}
      </Box>
    </Box>
  );
};

export default HeaderLeft;

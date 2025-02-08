import { Pressable } from "react-native";
import { Text } from "@/atom";
import FeatherIcon, { IconNames } from "./icon";

type Props = {
  title: string,
  handleClickItem : () => void,
  icon : IconNames
}

const SettingItem = ({ title, handleClickItem, icon} : Props) => {
  
  return (
    <Pressable onPress={handleClickItem}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <FeatherIcon name={icon} size={20} color={"$sidebarForeground"} />
      <Text marginLeft="s" color={"$sidebarForeground"}>
      {title} 
      </Text>
    </Pressable>
  );
};

export default SettingItem;

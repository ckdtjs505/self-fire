import { Pressable } from "react-native";
import { Box, Text } from "@/atom";
import FeatherIcon, { IconNames } from "./icon";

type Props = {
  title: string;
  handleClickItem: () => void;
  icon: IconNames;
  rightElement?: React.ReactNode;
};

const SettingItem = ({ title, handleClickItem, icon, rightElement }: Props) => {
  return (
    <Pressable
      onPress={handleClickItem}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        minHeight: 56,
        paddingHorizontal: 16,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <FeatherIcon name={icon} size={20} color={"$sidebarForeground"} />
      <Box flex={1} marginLeft="s">
        <Text color={"$sidebarForeground"} fontWeight="500">
          {title}
        </Text>
      </Box>
      {rightElement ? (
        rightElement
      ) : (
        <FeatherIcon
          name="chevron-right"
          size={18}
          color={"$sidebarForeground"}
          style={{ opacity: 0.5 }}
        />
      )}
    </Pressable>
  );
};

export default SettingItem;

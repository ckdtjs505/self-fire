import { Box, Text } from "@/atom";
import { useThemeStore } from "@/store/theme";
import { Pressable } from "react-native";

const ThemeItem = ({ item }) => {
  const { updateThemeId } = useThemeStore();
  return (
    <Box
      borderColor={"black"}
      borderWidth={0.5}
      flex={1}
      borderRadius={"md"}
      style={{ backgroundColor: item.theme.colors.$background }}
    >
      <Pressable onPress={ () => updateThemeId(item.id)}>
        <Text
          fontSize={20}
          textAlign={"center"}
          padding={"xxl"}
          style={{ color: item.theme.colors.$foreground }}
        >
          {item.id}
        </Text>
      </Pressable>
    </Box>
  );
};

export default ThemeItem;

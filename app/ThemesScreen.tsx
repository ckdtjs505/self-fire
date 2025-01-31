import { Box, Text } from "@/atom";
import { useThemeStore } from "@/store/theme";
import { Pressable } from "react-native";

const ThemeScreen = () => {
  const { updateThemeId } = useThemeStore();
  return (
    <Box>
      <Pressable onPress={() => updateThemeId("light")}>
        <Text> light </Text>
      </Pressable>

      <Pressable onPress={() => updateThemeId("dark")}>
        <Text> Dark </Text>
      </Pressable>
    </Box>
  );
};

export default ThemeScreen;

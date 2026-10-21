import { Box } from "@/atom";
import { useAppTheme } from "@/themes";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import FeatherIcon from "./icon";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/**
 * 목록 위에 두는 검색창: [돋보기] 입력 ............ [지우기]
 */
const SearchBar: React.FC<Props> = ({ value, onChangeText, placeholder = "내용이나 작성자로 찾기" }) => {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      bg="$surface"
      borderRadius="pill"
      borderWidth={1.5}
      borderColor={focused ? "$primary" : "$border"}
      height={46}
      paddingHorizontal="lg"
      marginHorizontal="lg"
      gap="s"
    >
      <FeatherIcon name="search" size={17} color="$muted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.$muted}
        selectionColor={colors.$primary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="명언 검색"
        style={[styles.input, { color: colors.$foreground }]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} accessibilityRole="button" accessibilityLabel="검색어 지우기">
          <FeatherIcon name="x-circle" size={17} color="$muted" />
        </Pressable>
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
});

export default SearchBar;

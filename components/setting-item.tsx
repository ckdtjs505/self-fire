import { Box, Text } from "@/atom";
import { useAppTheme } from "@/themes";
import { Pressable, Switch } from "react-native";
import FeatherIcon, { IconNames } from "./icon";

type SettingItemProps = {
  title: string;
  icon: IconNames;
  onPress?: () => void;
  // 오른쪽에 표시할 요소. 없으면 '>' 화살표를 보여준다.
  rightElement?: React.ReactNode;
};

// 설정 목록의 한 줄: [아이콘 타일] 제목 ........ [오른쪽 요소]
const SettingItem = ({ title, icon, onPress, rightElement }: SettingItemProps) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={({ pressed }) => ({
      flexDirection: "row",
      alignItems: "center",
      minHeight: 58,
      paddingHorizontal: 14,
      gap: 12,
      opacity: pressed ? 0.6 : 1,
    })}
  >
    <Box width={34} height={34} borderRadius="sm" bg="$surfaceMuted" justifyContent="center" alignItems="center">
      <FeatherIcon name={icon} size={17} />
    </Box>
    <Text variant="body" style={{ flex: 1 }}>
      {title}
    </Text>
    {rightElement ?? <FeatherIcon name="chevron-right" size={18} color="$muted" />}
  </Pressable>
);

// 제목 + 둥근 카드로 묶인 설정 그룹
export const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box marginBottom="xl">
    <Text variant="overline" marginBottom="s" marginLeft="xs">
      {title}
    </Text>
    <Box bg="$surface" borderWidth={1} borderColor="$border" borderRadius="lg" overflow="hidden">
      {children}
    </Box>
  </Box>
);

// 설정 항목 사이 구분선 (아이콘 타일 오른쪽부터 그린다)
export const SettingDivider: React.FC = () => <Box height={1} bg="$border" style={{ marginLeft: 60 }} />;

// 설정 화면 공통 스타일의 스위치 (켜지면 테마 강조색)
export const SettingSwitch: React.FC<{ value: boolean; onValueChange: (value: boolean) => void }> = ({
  value,
  onValueChange,
}) => {
  const { colors } = useAppTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.$surfaceMuted, true: colors.$primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.$surfaceMuted}
    />
  );
};

export default SettingItem;

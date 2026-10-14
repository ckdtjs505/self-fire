import { Box, Text } from "@/atom";
import { Pressable, Switch } from "react-native";
import FeatherIcon, { IconNames } from "./icon";

type SettingItemProps = {
  title: string;
  icon: IconNames;
  onPress?: () => void;
  // 오른쪽에 표시할 요소. 없으면 '>' 화살표를 보여준다.
  rightElement?: React.ReactNode;
};

// 설정 목록의 한 줄
const SettingItem = ({ title, icon, onPress, rightElement }: SettingItemProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexDirection: "row",
      alignItems: "center",
      minHeight: 56,
      paddingHorizontal: 16,
      opacity: pressed ? 0.6 : 1,
    })}
  >
    <FeatherIcon name={icon} size={20} color="$sidebarForeground" />
    <Box flex={1} marginLeft="s">
      <Text color="$sidebarForeground" fontWeight="500">
        {title}
      </Text>
    </Box>
    {rightElement ?? (
      <FeatherIcon name="chevron-right" size={18} color="$sidebarForeground" style={{ opacity: 0.5 }} />
    )}
  </Pressable>
);

// 제목 + 둥근 카드로 묶인 설정 그룹
export const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box marginBottom="lg">
    <Text fontSize={14} fontWeight="600" color="$foreground" marginBottom="s" marginLeft="s" style={{ opacity: 0.6 }}>
      {title}
    </Text>
    <Box bg="$sidebarBackground" borderRadius="md" overflow="hidden">
      {children}
    </Box>
  </Box>
);

// 설정 항목 사이 구분선
export const SettingDivider: React.FC = () => (
  <Box height={1} bg="$background" marginHorizontal="md" style={{ opacity: 0.1 }} />
);

// 설정 화면 공통 스타일의 스위치
export const SettingSwitch: React.FC<{ value: boolean; onValueChange: (value: boolean) => void }> = ({
  value,
  onValueChange,
}) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    trackColor={{ false: "#767577", true: "#2185d0" }}
    thumbColor={value ? "#ffffff" : "#f4f3f4"}
  />
);

export default SettingItem;

import { Box, Text } from "@/atom";
import { useRouter } from "expo-router";
import HeaderIconButton from "./header-icon-button";
import FeatherIcon, { IconNames } from "./icon";

type Props = {
  title: string;
  // 왼쪽 버튼 아이콘. 누르면 이전 화면으로 돌아간다.
  backIcon?: Extract<IconNames, "arrow-left" | "x">;
  // 오른쪽에 둘 요소 (예: 추가·저장 버튼)
  right?: React.ReactNode;
};

/**
 * 하위 화면 공통 헤더: [뒤로] 제목 ............ [오른쪽 요소]
 */
const ScreenHeader: React.FC<Props> = ({ title, backIcon = "arrow-left", right }) => {
  const router = useRouter();

  return (
    <Box flexDirection="row" alignItems="center" px="lg" py="s" minHeight={58} gap="md">
      <HeaderIconButton onPress={() => router.back()} accessibilityLabel="뒤로">
        <FeatherIcon name={backIcon} size={20} />
      </HeaderIconButton>
      <Text variant="heading" numberOfLines={1} style={{ flex: 1 }}>
        {title}
      </Text>
      {right}
    </Box>
  );
};

export default ScreenHeader;

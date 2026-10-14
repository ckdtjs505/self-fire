import { Box } from "@/atom";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import HeaderIconButton from "./header-icon-button";
import FeatherIcon from "./icon";

type Props = {
  // 메뉴 버튼 오른쪽에 붙일 요소 (예: 스트릭 뱃지)
  children?: React.ReactNode;
};

// 좌측 상단: 사이드바(Drawer) 열기 버튼
const HeaderLeft: React.FC<Props> = ({ children }) => {
  const navigation = useNavigation();

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      minHeight={44}
      alignItems="center"
      justifyContent="space-between"
      flexDirection="row"
      zIndex={10}
    >
      <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
        <Box m="md">
          <HeaderIconButton onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <FeatherIcon name="menu" size={20} />
          </HeaderIconButton>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default HeaderLeft;

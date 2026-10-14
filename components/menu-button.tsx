import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import HeaderIconButton from "./header-icon-button";
import FeatherIcon from "./icon";

// 사이드바(Drawer)를 여닫는 메뉴 버튼
const MenuButton: React.FC = () => {
  const navigation = useNavigation();

  return (
    <HeaderIconButton
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      accessibilityLabel="메뉴 열기"
    >
      <FeatherIcon name="menu" size={20} />
    </HeaderIconButton>
  );
};

export default MenuButton;

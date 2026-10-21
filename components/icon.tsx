import { ColorProps, useResponsiveProp } from "@shopify/restyle";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Theme, useAppTheme } from "@/themes";

// 테마 색상 키(예: "$foreground")를 color로 받는 아이콘 컴포넌트들.

export type IconProps = React.ComponentProps<typeof Feather>;
export type IconNames = IconProps["name"];
export type IoniconProps = React.ComponentProps<typeof Ionicons>;
export type IoniconNames = IoniconProps["name"];

// 테마 색상 키를 실제 색상 값으로 변환한다.
type ThemeColor = keyof Theme["colors"];
const useThemeColor = (color: ColorProps<Theme>["color"]) => {
  const theme = useAppTheme();
  const colorKey = useResponsiveProp(color) as ThemeColor | undefined;
  return theme.colors[colorKey || "$foreground"];
};

type FeatherIconProps = Omit<IconProps, "color"> & ColorProps<Theme>;
const FeatherIcon: React.FC<FeatherIconProps> = ({ color = "$foreground", ...rest }) => (
  <Feather {...rest} color={useThemeColor(color)} />
);

type IoniconComponentProps = Omit<IoniconProps, "color"> & ColorProps<Theme>;
export const Ionicon: React.FC<IoniconComponentProps> = ({ color = "$foreground", ...rest }) => (
  <Ionicons {...rest} color={useThemeColor(color)} />
);

export default FeatherIcon;

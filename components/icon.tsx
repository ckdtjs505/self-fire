import { ColorProps, useResponsiveProp, useTheme } from "@shopify/restyle";

import { Feather, Ionicons } from "@expo/vector-icons";
import { Theme } from "@/themes";

export type IconProps = React.ComponentProps<typeof Feather>;
export type IconNames = React.ComponentProps<typeof Feather>["name"];

type Props = Omit<IconProps, "color"> & ColorProps<Theme>;
const FeatherIcon: React.FC<Props> = ({ color = "$foreground", ...rest }) => {
  const theme = useTheme<Theme>();

  const textColorProp = useResponsiveProp(color);
  const bgColor = theme.colors[textColorProp || "$foreground"];
  return <Feather {...rest} color={bgColor}></Feather>;
};

export type IoniconProps = React.ComponentProps<typeof Ionicons>;
export type IoniconNames = React.ComponentProps<typeof Ionicons>["name"];

type IoniconComponentProps = Omit<IoniconProps, "color"> & ColorProps<Theme>;
export const Ionicon: React.FC<IoniconComponentProps> = ({ color = "$foreground", ...rest }) => {
  const theme = useTheme<Theme>();

  const textColorProp = useResponsiveProp(color);
  const bgColor = theme.colors[textColorProp || "$foreground"];
  return <Ionicons {...rest} color={bgColor}></Ionicons>;
};

export default FeatherIcon;


import { ColorProps, useResponsiveProp, useTheme } from "@shopify/restyle";

import { Feather } from "@expo/vector-icons";
import { Theme } from "@/themes";

export type IconProps = React.ComponentProps<typeof Feather>;
type Props = Omit<IconProps, "color"> & ColorProps<Theme>;
const FeatherIcon: React.FC<Props> = ({ color = "$foreground", ...rest }) => {
  const theme = useTheme<Theme>();

  const textColorProp = useResponsiveProp(color);
  const bgColor = theme.colors[textColorProp || "$foreground"];
  return <Feather {...rest} color={bgColor}></Feather>;
};
export default FeatherIcon;

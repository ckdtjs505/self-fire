import { Theme } from "@/themes";
import { createBox } from "@shopify/restyle";
import { SafeAreaView as NativeSafeAreaView } from "react-native-safe-area-context";

type SafeAreaViewProps = React.ComponentProps<typeof NativeSafeAreaView>;
type Props = SafeAreaViewProps & Theme;

const SafeAreaView = createBox<Props, SafeAreaViewProps>(NativeSafeAreaView);

export default SafeAreaView;

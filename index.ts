// 앱 진입점. expo-router 앱을 띄우고, Android 홈 화면 위젯을 그리는 헤드리스 작업을 등록한다.
// (위젯은 앱 화면 없이도 그려져야 하므로 화면 컴포넌트가 아닌 진입점에서 등록한다)
import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "./widgets/widget-task-handler";

registerWidgetTaskHandler(widgetTaskHandler);

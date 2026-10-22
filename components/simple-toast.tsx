import { useAppTheme } from "@/themes";
import { Feather } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { ToastConfig, ToastConfigParams } from "react-native-toast-message";

// react-native-toast-message의 기본 UI 대신 쓰는 스낵바. (Material 스낵바처럼)
//   - 화면 아래, 좌우 16 여백의 둥근 사각형. 왼쪽에 종류 아이콘, 가운데 메시지(왼쪽 정렬), 오른쪽에 동작 하나
//   - 현재 테마의 글자색을 배경으로 써서(반전) 어느 테마에서나 또렷하게 보인다.
//   - text2가 있으면 text2를, 없으면 text1을 메시지로 보여준다.
//   - props.action이 있으면 오른쪽에 그 동작을, props.onUndo가 있으면 '되돌리기'를 붙인다.
// 화면이 바뀌어 결과가 바로 보이는 일에는 띄우지 않는다. (되돌릴 수 있거나, 화면만 봐서는 모르는 결과에만)
type ToastAction = { label: string; onPress: () => void };
type ToastProps = { onUndo?: () => void; action?: ToastAction };

type Kind = "success" | "error" | "info";
const ICONS: Record<Kind, ComponentProps<typeof Feather>["name"]> = {
  success: "check-circle",
  error: "alert-circle",
  info: "info",
};

const Snackbar = ({ kind, text1, text2, props }: ToastConfigParams<ToastProps> & { kind: Kind }) => {
  const { colors } = useAppTheme();
  const message = text2 || text1;
  if (!message) return null;
  const action = props?.action ?? (props?.onUndo ? { label: "되돌리기", onPress: props.onUndo } : undefined);

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: colors.$foreground,
        borderRadius: 14,
        minHeight: 52,
        paddingLeft: 16,
        paddingRight: action ? 8 : 16,
        paddingVertical: 10,
        marginHorizontal: 16,
        alignSelf: "stretch",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <Feather name={ICONS[kind]} size={18} color={colors.$background} />
      <Text style={{ flex: 1, color: colors.$background, fontSize: 14, lineHeight: 20, fontWeight: "600" }}>{message}</Text>
      {action && (
        <Pressable
          onPress={action.onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 10, paddingVertical: 8 })}
        >
          <Text style={{ color: colors.$background, fontSize: 14, fontWeight: "800" }}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
};

// 종류마다 아이콘만 다르다. undo는 되돌릴 수 있는 완료라 success 아이콘을 쓴다.
export const toastConfig: ToastConfig = {
  success: (params) => <Snackbar kind="success" {...params} />,
  error: (params) => <Snackbar kind="error" {...params} />,
  info: (params) => <Snackbar kind="info" {...params} />,
  undo: (params) => <Snackbar kind="success" {...params} />,
};

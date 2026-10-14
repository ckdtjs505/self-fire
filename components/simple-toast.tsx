import { Theme } from "@/themes";
import { useTheme } from "@shopify/restyle";
import { Text, View } from "react-native";
import { ToastConfig, ToastConfigParams } from "react-native-toast-message";

// react-native-toast-message의 기본 UI 대신 쓰는 알약 모양 토스트.
// 현재 테마의 글자색을 배경으로 써서 어느 테마에서나 또렷하게 보인다.
// text2가 있으면 text2를, 없으면 text1을 메시지로 보여준다.
const SimpleToast = ({ text1, text2 }: ToastConfigParams<unknown>) => {
  const { colors } = useTheme<Theme>();
  const message = text2 || text1;
  if (!message) return null;

  return (
    <View
      style={{
        backgroundColor: colors.$foreground,
        borderRadius: 100,
        paddingHorizontal: 22,
        paddingVertical: 13,
        marginHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <Text style={{ color: colors.$background, fontSize: 14, fontWeight: "600", textAlign: "center" }}>{message}</Text>
    </View>
  );
};

// success / error / info 모두 같은 모양을 사용한다.
export const toastConfig: ToastConfig = {
  success: SimpleToast,
  error: SimpleToast,
  info: SimpleToast,
};

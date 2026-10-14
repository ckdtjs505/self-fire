import { Text, View } from "react-native";
import { ToastConfig, ToastConfigParams } from "react-native-toast-message";

// react-native-toast-message의 기본 UI 대신 쓰는 어두운 알약 모양 토스트.
// text2가 있으면 text2를, 없으면 text1을 메시지로 보여준다.
const SimpleToast = ({ text1, text2 }: ToastConfigParams<unknown>) => {
  const message = text2 || text1;
  if (!message) return null;

  return (
    <View
      style={{
        backgroundColor: "#333333",
        borderRadius: 100,
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600", textAlign: "center" }}>{message}</Text>
    </View>
  );
};

// success / error / info 모두 같은 모양을 사용한다.
export const toastConfig: ToastConfig = {
  success: SimpleToast,
  error: SimpleToast,
  info: SimpleToast,
};

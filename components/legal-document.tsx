import { SafeAreaView, Text } from "@/atom";
import { ScrollView } from "react-native";
import ScreenHeader from "./screen-header";

type Props = {
  title: string;
  body: string;
};

// 개인정보 처리방침 / 서비스 이용약관처럼 제목 + 긴 본문만 있는 화면
const LegalDocument: React.FC<Props> = ({ title, body }) => (
  <SafeAreaView flex={1} bg="$background">
    <ScreenHeader title={title} />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40 }}>
      <Text fontSize={14} lineHeight={23} color="$muted">
        {body}
      </Text>
    </ScrollView>
  </SafeAreaView>
);

export default LegalDocument;

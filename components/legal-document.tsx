import { Box, SafeAreaView, Text } from "@/atom";
import { useRouter } from "expo-router";
import { Pressable, ScrollView } from "react-native";
import FeatherIcon from "./icon";

type Props = {
  title: string;
  body: string;
};

// 개인정보 처리방침 / 서비스 이용약관처럼 제목 + 긴 본문만 있는 화면
const LegalDocument: React.FC<Props> = ({ title, body }) => {
  const router = useRouter();

  return (
    <SafeAreaView flex={1}>
      <Box backgroundColor="$background" flex={1}>
        <Box
          padding="md"
          flexDirection="row"
          alignItems="center"
          borderBottomWidth={1}
          style={{ borderBottomColor: "rgba(0,0,0,0.05)" }}
        >
          <Pressable onPress={() => router.back()}>
            <Box padding="s">
              <FeatherIcon name="arrow-left" size={24} color="$foreground" />
            </Box>
          </Pressable>
          <Text fontSize={18} fontWeight="bold" marginLeft="s">
            {title}
          </Text>
        </Box>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text fontSize={14} lineHeight={22} color="$foreground">
            {body}
          </Text>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
};

export default LegalDocument;

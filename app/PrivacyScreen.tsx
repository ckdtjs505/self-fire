import { Box, SafeAreaView, Text } from "@/atom";
import { ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import FeatherIcon from "@/components/icon";
import { PRIVACY_POLICY } from "@/data/legal";

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView flex={1}>
      <Box backgroundColor={"$background"} flex={1}>
        <Box 
          padding="md" 
          flexDirection="row" 
          alignItems="center" 
          borderBottomWidth={1} 
          borderBottomColor="$background"
          style={{ borderBottomColor: "rgba(0,0,0,0.05)" }}
        >
          <Pressable onPress={() => router.back()}>
            <Box padding="s">
              <FeatherIcon name="arrow-left" size={24} color="$foreground" />
            </Box>
          </Pressable>
          <Text fontSize={18} fontWeight="bold" marginLeft="s">
            개인정보 처리방침
          </Text>
        </Box>
        
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text fontSize={14} lineHeight={22} color="$foreground">
            {PRIVACY_POLICY}
          </Text>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

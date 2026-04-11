import { Box, SafeAreaView, Text } from "@/atom";
import { ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import FeatherIcon from "@/components/icon";
import { TERMS_OF_SERVICE } from "@/data/legal";

export default function TermsScreen() {
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
            서비스 이용약관
          </Text>
        </Box>
        
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text fontSize={14} lineHeight={22} color="$foreground">
            {TERMS_OF_SERVICE}
          </Text>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

import React from "react";
import { Box, SafeAreaView, Text } from "@/atom";
import { useFavoriteQuoteStore } from "@/store/quote";
import { FlatList, Pressable, Alert } from "react-native";
import FeatherIcon from "@/components/icon";
import { useRouter } from "expo-router";

export default function MyQuotesScreen() {
  const router = useRouter();
  const { customQuotes, removeCustomQuote } = useFavoriteQuoteStore();

  const handleDelete = (id: string) => {
    Alert.alert(
      "삭제 확인",
      "이 명언을 정말 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive", 
          onPress: () => removeCustomQuote(id) 
        }
      ]
    );
  };

  return (
    <SafeAreaView flex={1}>
      <Box backgroundColor={"$background"} flex={1}>
        <Box flexDirection="row" alignItems="center" padding="md" justifyContent="space-between" borderBottomWidth={1} borderBottomColor="$headerBackground">
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <FeatherIcon name="chevron-left" size={24} color="$foreground" />
          </Pressable>
          <Text fontSize={20} fontWeight="bold" color="$foreground">나만의 명언</Text>
          <Pressable onPress={() => router.push("/AddQuoteScreen")} style={{ padding: 4 }}>
            <FeatherIcon name="plus" size={24} color="$primary" />
          </Pressable>
        </Box>
        <FlatList
          data={customQuotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Box flex={1} justifyContent="center" alignItems="center" padding="xl" marginTop="hg">
              <Box 
                width={80} 
                height={80} 
                borderRadius="hg" 
                bg="$sidebarBackground" 
                justifyContent="center" 
                alignItems="center"
                style={{ opacity: 0.5 }}
              >
                <FeatherIcon name="edit-3" size={40} color="$foreground" />
              </Box>
              <Text marginTop="xl" fontSize={18} fontWeight="bold" color="$foreground" style={{ opacity: 0.7 }}>
                명언이 아직 없습니다.
              </Text>
              <Text marginTop="s" color="$foreground" style={{ opacity: 0.5, textAlign: 'center' }}>
                당신의 마음을 울리는 첫 번째{"\n"}명언을 직접 기록해 보세요.
              </Text>
              <Pressable 
                onPress={() => router.push("/AddQuoteScreen")}
                style={({ pressed }) => ({
                  marginTop: 32,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: '#2185d0',
                  borderRadius: 24,
                  opacity: pressed ? 0.8 : 1
                })}
              >
                <Text color="white" fontWeight="bold" fontSize={16}>첫 명언 등록하기</Text>
              </Pressable>
            </Box>
          }
          renderItem={({ item }) => (
            <Box
              bg="$sidebarBackground"
              marginHorizontal="md"
              marginVertical="xs"
              borderRadius="lg"
              padding="lg"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Box flex={1} marginRight="md">
                <Text color="$sidebarForeground" fontSize={17} fontWeight="600" lineHeight={24}>
                  "{item.text}"
                </Text>
                <Text color="$sidebarForeground" fontSize={13} marginTop="s" style={{ opacity: 0.5 }}>
                  — {item.author}
                </Text>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <Pressable 
                  onPress={() => router.push({
                    pathname: "/AddQuoteScreen",
                    params: { id: item.id, text: item.text, author: item.author }
                  })}
                  style={({ pressed }) => ({
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : undefined,
                    marginRight: 8
                  })}
                >
                  <FeatherIcon name="edit-2" size={18} color="$sidebarForeground" style={{ opacity: 0.7 }} />
                </Pressable>
                <Pressable 
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => ({
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: pressed ? 'rgba(255,0,0,0.1)' : undefined
                  })}
                >
                  <FeatherIcon name="trash-2" size={18} color="red" style={{ opacity: 0.8 }} />
                </Pressable>
              </Box>
            </Box>
          )}
        />
      </Box>
    </SafeAreaView>
  );
}

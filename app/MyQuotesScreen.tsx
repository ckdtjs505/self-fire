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
          ListEmptyComponent={
            <Box flex={1} justifyContent="center" alignItems="center" padding="xl" marginTop="hg">
              <FeatherIcon name="edit" size={48} style={{ opacity: 0.2 }} />
              <Text marginTop="md" style={{ opacity: 0.5 }}>등록된 명언이 없습니다.</Text>
              <Text style={{ opacity: 0.5 }}>새로운 명언을 만들어보세요!</Text>
            </Box>
          }
          renderItem={({ item }) => (
            <Box
              bg="$sidebarBackground"
              marginHorizontal="md"
              marginVertical="xs"
              borderRadius="md"
              padding="md"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flex={1} marginRight="s">
                <Text color="$sidebarForeground" fontSize={16} fontWeight="bold" numberOfLines={2}>
                  {item.text}
                </Text>
                <Text color="$sidebarForeground" fontSize={14} marginTop="xs" style={{ opacity: 0.7 }}>
                  - {item.author}
                </Text>
              </Box>
              <Box flexDirection="row">
                <Pressable 
                  onPress={() => router.push({
                    pathname: "/AddQuoteScreen",
                    params: { id: item.id, text: item.text, author: item.author }
                  })}
                  style={{ marginRight: 16 }}
                >
                  <FeatherIcon name="edit-2" size={20} color="$sidebarForeground" />
                </Pressable>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <FeatherIcon name="trash-2" size={20} color="red" />
                </Pressable>
              </Box>
            </Box>
          )}
        />
      </Box>
    </SafeAreaView>
  );
}

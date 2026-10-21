// ─────────────────────────────────────────────────────────────
// app/my-quotes.tsx
// 사용자가 직접 작성한 명언 목록. 추가 / 수정 / 삭제하고, 내용·작성자로 찾을 수 있다.
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import HeaderIconButton from "@/components/header-icon-button";
import FeatherIcon from "@/components/icon";
import ScreenHeader from "@/components/screen-header";
import SearchBar from "@/components/search-bar";
import { searchQuotes } from "@/data/quote-search";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable } from "react-native";
import { useShallow } from "zustand/react/shallow";

// 목록이 비었을 때 안내 + 첫 명언 등록 버튼
const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <Box flex={1} justifyContent="center" alignItems="center" padding="xl" style={{ marginTop: 96 }}>
    <Box width={76} height={76} borderRadius="pill" bg="$primarySoft" justifyContent="center" alignItems="center">
      <FeatherIcon name="edit-3" size={30} color="$primary" />
    </Box>
    <Text variant="heading" marginTop="xl">
      아직 작성한 명언이 없어요
    </Text>
    <Text variant="caption" fontSize={14} marginTop="s" textAlign="center" lineHeight={21}>
      당신의 마음을 울리는 첫 번째{"\n"}명언을 직접 기록해 보세요.
    </Text>
    <Pressable onPress={onAdd} style={({ pressed }) => ({ marginTop: 28, opacity: pressed ? 0.8 : 1 })}>
      <Box bg="$primary" borderRadius="pill" height={50} px="xl" flexDirection="row" alignItems="center" style={{ gap: 6 }}>
        <FeatherIcon name="plus" size={18} color="$onPrimary" />
        <Text color="$onPrimary" fontWeight="800" fontSize={15}>
          첫 명언 등록하기
        </Text>
      </Box>
    </Pressable>
  </Box>
);

type QuoteRowProps = {
  quote: Quote;
  onEdit: () => void;
  onDelete: () => void;
};

// 명언 한 장: 누르면 수정, 휴지통 버튼으로 삭제
const QuoteRow: React.FC<QuoteRowProps> = ({ quote, onEdit, onDelete }) => (
  <Pressable
    onPress={onEdit}
    accessibilityRole="button"
    accessibilityHint="눌러서 명언을 수정합니다"
    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
  >
    <Box
      bg="$surface"
      borderWidth={1}
      borderColor="$border"
      marginHorizontal="lg"
      marginBottom="s"
      borderRadius="lg"
      padding="lg"
      flexDirection="row"
      alignItems="flex-start"
      style={{ gap: 12 }}
    >
      <Box flex={1}>
        <Text fontSize={16} fontWeight="600" lineHeight={25}>
          {quote.text}
        </Text>
        <Text variant="caption" marginTop="s">
          {quote.author}
        </Text>
      </Box>

      <Pressable onPress={onDelete} hitSlop={8} accessibilityRole="button" accessibilityLabel="명언 삭제" style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        <Box width={34} height={34} borderRadius="pill" bg="$surfaceMuted" justifyContent="center" alignItems="center">
          <FeatherIcon name="trash-2" size={15} color="$muted" />
        </Box>
      </Pressable>
    </Box>
  </Pressable>
);

export default function MyQuotesScreen() {
  const router = useRouter();
  const { customQuotes, removeCustomQuote } = useFavoriteQuoteStore(
    useShallow((s) => ({
      customQuotes: s.customQuotes,
      removeCustomQuote: s.removeCustomQuote,
    }))
  );

  const [query, setQuery] = useState("");
  const results = searchQuotes(customQuotes, query);
  const hasQuotes = customQuotes.length > 0;

  const goToAdd = () => router.push("/add-quote");

  // 수정 화면에 기존 내용을 파라미터로 넘긴다.
  const goToEdit = ({ id, text, author }: Quote) =>
    router.push({ pathname: "/add-quote", params: { id, text, author } });

  const confirmDelete = (id: string) => {
    Alert.alert("삭제 확인", "이 명언을 정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => removeCustomQuote(id) },
    ]);
  };

  return (
    <SafeAreaView flex={1} bg="$background">
      <ScreenHeader
        title="나만의 명언"
        right={
          hasQuotes && (
            <HeaderIconButton active onPress={goToAdd} accessibilityLabel="명언 추가">
              <FeatherIcon name="plus" size={20} color="$onPrimary" />
            </HeaderIconButton>
          )
        }
      />

      {hasQuotes && (
        <Box paddingBottom="s">
          <SearchBar value={query} onChangeText={setQuery} />
        </Box>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={
          hasQuotes ? (
            <Text variant="caption" textAlign="center" style={{ marginTop: 72 }}>
              ‘{query.trim()}’에 맞는 명언이 없어요
            </Text>
          ) : (
            <EmptyState onAdd={goToAdd} />
          )
        }
        renderItem={({ item }) => (
          <QuoteRow quote={item} onEdit={() => goToEdit(item)} onDelete={() => confirmDelete(item.id)} />
        )}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// app/favorites.tsx
// 저장한 문장 목록. 저장한 명언을 최근 저장순으로 보여 주고, 내용·작성자로 찾을 수 있다.
//   - 명언을 누르면 홈의 저장한 문장 보기에서 그 명언부터 넘겨 본다.
//   - 저장 버튼으로 저장을 취소한다. (토스트의 '되돌리기'로 바로 되살릴 수 있다)
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import FeatherIcon, { Ionicon } from "@/components/icon";
import ScreenHeader from "@/components/screen-header";
import SearchBar from "@/components/search-bar";
import { getFavoriteQuotes } from "@/data/quote-pager";
import { searchQuotes } from "@/data/quote-search";
import { quotes as bundledQuotes } from "@/data/quotes";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { trackEvent } from "@/utils/analytics";
import { tapHaptic } from "@/utils/haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { useShallow } from "zustand/react/shallow";

// 저장한 문장이 없을 때
const EmptyState = () => (
  <Box flex={1} justifyContent="center" alignItems="center" padding="xl" style={{ marginTop: 96 }}>
    <Box width={76} height={76} borderRadius="pill" bg="$surfaceMuted" justifyContent="center" alignItems="center">
      <Ionicon name="bookmark-outline" size={30} color="$muted" />
    </Box>
    <Text variant="heading" marginTop="xl">
      아직 저장한 문장이 없어요
    </Text>
    <Text variant="caption" fontSize={14} marginTop="s" textAlign="center" lineHeight={21}>
      마음에 닿은 문장 아래{"\n"}저장 버튼을 눌러 모아 보세요.
    </Text>
  </Box>
);

// 검색 결과가 없을 때
const NoResults: React.FC<{ query: string; onClear: () => void }> = ({ query, onClear }) => (
  <Box alignItems="center" padding="xl" style={{ marginTop: 72 }}>
    <FeatherIcon name="search" size={28} color="$muted" />
    <Text variant="body" marginTop="md" textAlign="center">
      ‘{query.trim()}’에 맞는 문장이 없어요
    </Text>
    <Text variant="caption" marginTop="xs" textAlign="center">
      띄어쓰기 없이 짧게 찾거나 작성자 이름으로 찾아보세요.
    </Text>
    <Pressable onPress={onClear} hitSlop={8} style={({ pressed }) => ({ marginTop: 16, opacity: pressed ? 0.6 : 1 })}>
      <Text fontSize={14} fontWeight="700" color="$primary">
        검색어 지우기
      </Text>
    </Pressable>
  </Box>
);

type FavoriteRowProps = {
  quote: Quote;
  onOpen: () => void;
  onRemove: () => void;
};

// 저장한 명언 한 장: 누르면 홈에서 열고, 저장 버튼으로 저장 취소
const FavoriteRow: React.FC<FavoriteRowProps> = ({ quote, onOpen, onRemove }) => (
  <Pressable
    onPress={onOpen}
    accessibilityRole="button"
    accessibilityHint="눌러서 이 명언부터 넘겨 봅니다"
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
      <Box width={3} alignSelf="stretch" borderRadius="pill" bg="$border" />
      <Box flex={1}>
        <Text fontSize={16} fontWeight="600" lineHeight={25}>
          {quote.text}
        </Text>
        {!!quote.author && (
          <Text variant="caption" marginTop="s">
            {quote.author}
          </Text>
        )}
      </Box>

      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="저장 취소"
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        <Box width={34} height={34} borderRadius="pill" bg="$surfaceMuted" justifyContent="center" alignItems="center">
          <Ionicon name="bookmark" size={15} color="$foreground" />
        </Box>
      </Pressable>
    </Box>
  </Pressable>
);

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, favoritesData, customQuotes, addFavorite, removeFavorite } = useFavoriteQuoteStore(
    useShallow((s) => ({
      favorites: s.favorites,
      favoritesData: s.favoritesData,
      customQuotes: s.customQuotes,
      addFavorite: s.addFavorite,
      removeFavorite: s.removeFavorite,
    }))
  );
  const [query, setQuery] = useState("");
  const searchTracked = useRef(false);

  // 최근에 저장한 명언이 위로 오게 한다. (id만 저장된 예전 저장은 번들 명언에서 보충)
  const allFavorites = getFavoriteQuotes(favorites, favoritesData, [...bundledQuotes, ...customQuotes]).reverse();
  const results = searchQuotes(allFavorites, query);
  const isSearching = query.trim().length > 0;

  const changeQuery = (text: string) => {
    setQuery(text);
    if (text.trim() && !searchTracked.current) {
      searchTracked.current = true;
      trackEvent("favorites_search");
    }
  };

  // 홈으로 돌아가 저장한 문장 보기에서 이 명언부터 보여 준다. (at: 같은 명언을 다시 눌러도 반영되도록)
  const openOnHome = (quote: Quote) => {
    trackEvent("favorite_open");
    router.dismissTo({ pathname: "/", params: { view: "favorites", at: String(Date.now()), quote: quote.id } });
  };

  const remove = (quote: Quote) => {
    tapHaptic();
    removeFavorite(quote.id);
    trackEvent("favorite_remove");
    Toast.show({
      type: "undo",
      text1: "저장을 취소했어요",
      props: {
        onUndo: () => {
          addFavorite(quote.id, quote);
          trackEvent("favorite_undo");
          Toast.hide();
        },
      },
    });
  };

  const hasFavorites = allFavorites.length > 0;

  return (
    <SafeAreaView flex={1} bg="$background">
      <ScreenHeader title="저장한 문장" />

      {hasFavorites && (
        <Box paddingBottom="s">
          <SearchBar value={query} onChangeText={changeQuery} />
          <Text variant="caption" fontSize={12} marginTop="md" marginHorizontal="xl" style={{ fontVariant: ["tabular-nums"] }}>
            {isSearching ? `${allFavorites.length}개 중 ${results.length}개` : `최근 저장순 · ${allFavorites.length}개`}
          </Text>
        </Box>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={hasFavorites ? <NoResults query={query} onClear={() => setQuery("")} /> : <EmptyState />}
        renderItem={({ item }) => <FavoriteRow quote={item} onOpen={() => openOnHome(item)} onRemove={() => remove(item)} />}
      />
    </SafeAreaView>
  );
}

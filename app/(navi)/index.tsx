// ─────────────────────────────────────────────────────────────
// app/(navi)/index.tsx
// 앱 메인 화면 (홈 화면).
// 핵심 기능:
//   - 명언 카드 표시 + 좌우 스와이프로 이전/다음 명언 전환
//   - 필터 모드: 전체 / 내가 쓴 명언 / 즐겨찾기 (모드별로 보던 위치 유지)
//   - 명언 풀(pool) 관리: 초기 50개 로드, 끝에 가까워지면 추가 로드
//   - 테마/폰트 변경 바텀시트
//   - AdMob 배너 광고 (광고 제거 미구매 시)
//   - 하루 1번 불씨 점화(Hold to Ignite) 화면
//   - Android 오버레이 권한 최초 요청 (잠금 해제 자동 실행용)
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import BannerAd from "@/components/banner-ad";
import FontPicker from "@/components/font-picker";
import HeaderIconButton from "@/components/header-icon-button";
import HeaderLeft from "@/components/header-left";
import FeatherIcon, { Ionicon } from "@/components/icon";
import { IgniteScreen } from "@/components/ignite-screen";
import { PickerSheetHandle } from "@/components/picker-sheet";
import QuoteSwiper from "@/components/quote-swiper";
import StreakBadge from "@/components/streak-badge";
import ThemePicker from "@/components/theme-picker";
import { fetchRandomQuotes, QUOTE_BATCH_SIZE } from "@/data/quote-api";
import { quotes as fallbackQuotes } from "@/data/quotes";
import { useDailyIgnite } from "@/hooks/useDailyIgnite";
import { useOverlayPermissionPrompt } from "@/hooks/useOverlayPermissionPrompt";
import { useStreak } from "@/hooks/useStreak";
import { Quote } from "@/models";
import { useAdStore } from "@/store/ad-store";
import { useFavoriteQuoteStore } from "@/store/quote";
import { shuffle } from "@/utils/shuffle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

// 오프라인 대비용으로 마지막에 받아온 명언을 저장하는 키
const QUOTE_CACHE_KEY = "cached_recent_quotes";

type FilterMode = "all" | "mine" | "favorites";

// 한 필터 모드에서 보고 있는 명언 목록과 위치
type QuotePager = {
  quotes: Quote[];
  currentIndex: number;
  // 이번 세션에서 가장 멀리 진행한 인덱스 ('이전에 본 명언' 뱃지 표시용)
  maxIndex: number;
};

const createPager = (quotes: Quote[] = []): QuotePager => ({ quotes, currentIndex: 0, maxIndex: 0 });

/**
 * 서버에서 명언을 받아온다.
 * 실패하면 최근 캐시 → 앱 내장 기본 명언 순으로 대체한다.
 */
const loadInitialQuotes = async (): Promise<Quote[]> => {
  try {
    const fetched = await fetchRandomQuotes();
    if (fetched.length > 0) {
      await AsyncStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(fetched));
      return fetched;
    }
  } catch (e) {
    console.warn("API Fetch failed, using cache or fallback", e);
  }

  try {
    const cached = await AsyncStorage.getItem(QUOTE_CACHE_KEY);
    const cachedQuotes: Quote[] | null = cached ? JSON.parse(cached) : null;
    if (cachedQuotes && cachedQuotes.length > 0) return cachedQuotes;
  } catch (e) {
    console.warn("Failed to read recent cache:", e);
  }

  return fallbackQuotes;
};

export default function Index() {
  const { isAdFree } = useAdStore();
  const { customQuotes, favorites } = useFavoriteQuoteStore();
  const { currentStreak } = useStreak();
  const { isIgnited, markIgnited } = useDailyIgnite();
  useOverlayPermissionPrompt();

  const themePickerRef = useRef<PickerSheetHandle>(null);
  const fontPickerRef = useRef<PickerSheetHandle>(null);

  // 서버(또는 캐시/기본값)에서 받아온 기본 명언
  const [defaultQuotes, setDefaultQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [pager, setPager] = useState<QuotePager>(createPager);
  // 다른 필터 모드로 전환했다 돌아올 때 보던 위치를 복원하기 위한 저장소
  const savedPagers = useRef<Record<FilterMode, QuotePager>>({
    all: createPager(),
    mine: createPager(),
    favorites: createPager(),
  });

  // ── 초기 명언 로드 ─────────────────────────────────────────
  useEffect(() => {
    loadInitialQuotes().then((loaded) => {
      setDefaultQuotes(loaded);
      setIsLoading(false);
    });
  }, []);

  // 기본 명언이 준비되면 첫 명언 풀을 만든다.
  useEffect(() => {
    if (defaultQuotes.length > 0) {
      setPager(createPager(buildPool(filterMode)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQuotes]);

  // ── buildPool ─────────────────────────────────────────────
  // 필터 모드에 맞는 명언 풀을 무작위 순서로 만든다.
  //   - 'all': 기본 + 커스텀 명언 중 무작위 50개
  //   - 'mine': 커스텀 명언 전체
  //   - 'favorites': 즐겨찾기한 명언 전체
  const buildPool = (mode: FilterMode): Quote[] => {
    const allQuotes = [...defaultQuotes, ...customQuotes];
    switch (mode) {
      case "mine":
        return shuffle(customQuotes);
      case "favorites":
        return shuffle(allQuotes.filter((q) => favorites.includes(q.id)));
      case "all":
        return shuffle(allQuotes).slice(0, QUOTE_BATCH_SIZE);
    }
  };

  // 저장해 둔 모드별 위치를 복원한다. 처음 보는 모드면 새 풀을 만든다.
  const restorePager = (mode: FilterMode): QuotePager => {
    const saved = savedPagers.current[mode];

    if (mode === "favorites") {
      // 그 사이 즐겨찾기에서 해제된 명언은 제외한다.
      const stillFavorite = saved.quotes.filter((q) => favorites.includes(q.id));
      if (stillFavorite.length === 0) return createPager(buildPool(mode));
      const lastIndex = stillFavorite.length - 1;
      return {
        quotes: stillFavorite,
        currentIndex: Math.min(saved.currentIndex, lastIndex),
        maxIndex: Math.min(saved.maxIndex, lastIndex),
      };
    }

    return saved.quotes.length > 0 ? saved : createPager(buildPool(mode));
  };

  const changeFilterMode = (nextMode: FilterMode) => {
    savedPagers.current[filterMode] = pager;
    setPager(restorePager(nextMode));
    setFilterMode(nextMode);
  };

  // 필터 버튼: 이미 켜져 있으면 전체 모드로 돌아가고, 아니면 해당 모드로 전환한다.
  // 해당 모드에 보여줄 명언이 없으면 안내 토스트만 띄운다.
  const toggleFilterMode = (mode: Exclude<FilterMode, "all">, isEmpty: boolean, emptyMessage: string) => {
    if (filterMode === mode) {
      changeFilterMode("all");
      return;
    }
    if (isEmpty) {
      Toast.show({ type: "info", text1: "알림", text2: emptyMessage });
      return;
    }
    changeFilterMode(mode);
  };

  // ── loadMoreQuotes ────────────────────────────────────────
  // '전체' 모드에서 목록 끝에 가까워지면 서버에서 명언을 더 받아와 뒤에 붙인다.
  const loadMoreQuotes = async () => {
    if (filterMode !== "all") return;

    try {
      const fetched = await fetchRandomQuotes();
      setPager((prev) => {
        const existingIds = new Set(prev.quotes.map((q) => q.id));
        const newQuotes = fetched.filter((q) => !existingIds.has(q.id));
        return { ...prev, quotes: [...prev.quotes, ...newQuotes] };
      });
    } catch (e) {
      console.warn("Failed to load more quotes:", e);
    }
  };

  // ── 이전/다음 명언 ─────────────────────────────────────────
  const showNextQuote = () => {
    const { quotes, currentIndex } = pager;
    if (quotes.length === 0) return;

    // 끝까지 보면 처음으로 돌아간다.
    const nextIndex = currentIndex + 1 >= quotes.length ? 0 : currentIndex + 1;
    if (nextIndex >= quotes.length - 2) loadMoreQuotes();

    setPager((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      maxIndex: Math.max(prev.maxIndex, nextIndex),
    }));
  };

  const showPrevQuote = () => {
    setPager((prev) => ({ ...prev, currentIndex: Math.max(prev.currentIndex - 1, 0) }));
  };

  if (isLoading) {
    return (
      <SafeAreaView flex={1}>
        <Box bg="$background" flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text mt="md" color="$foreground">명언 데이터를 불러오는 중...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  const currentQuote = pager.quotes[pager.currentIndex];
  const isMineMode = filterMode === "mine";
  const isFavoritesMode = filterMode === "favorites";

  return (
    <SafeAreaView flex={1}>
      <Box bg="$background" flex={1} justifyContent="center" alignItems="center">
        {/* 좌측 상단: 메뉴 + 연속 방문 스트릭 뱃지 */}
        <HeaderLeft>
          <StreakBadge streak={currentStreak} />
        </HeaderLeft>

        {/* 우측 상단: 내 명언 필터 / 불씨 보관함 필터 / 테마 / 폰트 */}
        <Box
          position="absolute"
          top={0}
          right={0}
          m="s"
          p="xs"
          minHeight={44}
          width={180}
          justifyContent="space-around"
          alignItems="center"
          flexDirection="row"
          zIndex={10}
        >
          <HeaderIconButton
            active={isMineMode}
            onPress={() =>
              toggleFilterMode("mine", customQuotes.length === 0, "아직 직접 작성한 명언이 없습니다. 명언을 먼저 등록해 보세요!")
            }
          >
            <FeatherIcon name={isMineMode ? "user-check" : "user"} size={20} color={isMineMode ? "white" : "$foreground"} />
          </HeaderIconButton>

          <HeaderIconButton
            active={isFavoritesMode}
            activeColor="red"
            onPress={() =>
              toggleFilterMode(
                "favorites",
                favorites.length === 0,
                "아직 보관된 불씨가 없습니다. 마음에 와닿는 문장에 불씨를 지펴보세요! 🔥"
              )
            }
          >
            <Ionicon
              name={isFavoritesMode ? "flame" : "flame-outline"}
              size={20}
              color={isFavoritesMode ? "white" : "$foreground"}
            />
          </HeaderIconButton>

          <HeaderIconButton onPress={() => themePickerRef.current?.open()}>
            <FeatherIcon name="image" size={20} />
          </HeaderIconButton>

          <HeaderIconButton onPress={() => fontPickerRef.current?.open()}>
            <FeatherIcon name="type" size={20} />
          </HeaderIconButton>
        </Box>

        {/* 명언 카드 (좌우 스와이프) */}
        <QuoteSwiper
          quote={currentQuote}
          isCustom={!!currentQuote && customQuotes.some((q) => q.id === currentQuote.id)}
          isRevisit={pager.currentIndex < pager.maxIndex}
          canGoPrev={pager.currentIndex > 0}
          onNext={showNextQuote}
          onPrev={showPrevQuote}
        />
      </Box>

      {!isAdFree && <BannerAd />}

      <ThemePicker ref={themePickerRef} />
      <FontPicker ref={fontPickerRef} />

      {/* 불씨를 직접 켜는 오버레이.
          TODO: 의도는 '오늘 아직 점화하지 않았을 때(!isIgnited)'만 표시하는 것이지만,
          현재 동작을 유지하기 위해 기존 조건(isIgnited)을 그대로 두었다. */}
      {isIgnited && <IgniteScreen onIgnited={markIgnited} />}
    </SafeAreaView>
  );
}

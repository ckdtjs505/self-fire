// ─────────────────────────────────────────────────────────────
// app/(navi)/index.tsx
// 앱 메인 화면 (홈 화면).
// 핵심 기능:
//   - 명언 카드 표시 + 좌우 스와이프로 이전/다음 명언 전환
//   - 필터 모드: 전체 / 내가 쓴 명언 / 즐겨찾기 (모드별로 보던 위치 유지, 수정·삭제 즉시 반영)
//   - 명언 풀(pool) 관리: 번들 명언에서 50개씩 샘플링, 새 명언은 백그라운드 동기화
//   - 테마/폰트 변경 바텀시트
//   - AdMob 배너 광고 (광고 제거 미구매 시)
//   - 하루 1번 불씨 점화(Hold to Ignite) 화면
//   - Android 오버레이 권한 최초 요청 (잠금 해제 자동 실행용)
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView } from "@/atom";
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
import { QUOTE_BATCH_SIZE } from "@/data/quote-api";
import { quotes as bundledQuotes, loadSyncedQuotes, syncNewQuotes } from "@/data/quotes";
import { useDailyIgnite } from "@/hooks/useDailyIgnite";
import { useOverlayPermissionPrompt } from "@/hooks/useOverlayPermissionPrompt";
import { useStreak } from "@/hooks/useStreak";
import { Quote } from "@/models";
import { useAdStore } from "@/store/ad-store";
import { useFavoriteQuoteStore } from "@/store/quote";
import { shuffle } from "@/utils/shuffle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";

// 예전 버전에서 쓰던 랜덤 50개 캐시 키 (정리용)
const LEGACY_QUOTE_CACHE_KEY = "cached_recent_quotes";

type FilterMode = "all" | "mine" | "favorites";

// 한 필터 모드에서 보고 있는 명언 목록과 위치
type QuotePager = {
  quotes: Quote[];
  currentIndex: number;
  // 이번 세션에서 가장 멀리 진행한 인덱스 ('이전에 본 명언' 뱃지 표시용)
  maxIndex: number;
};

const createPager = (quotes: Quote[] = []): QuotePager => ({ quotes, currentIndex: 0, maxIndex: 0 });

// 사용자가 직접 작성한 명언의 id (store/quote.ts의 addCustomQuote 참고)
const isCustomQuoteId = (id: string) => id.startsWith("custom-");

export default function Index() {
  const { isAdFree } = useAdStore();
  const { customQuotes, favorites, favoritesData } = useFavoriteQuoteStore();
  const { currentStreak } = useStreak();
  const { isIgnited, markIgnited } = useDailyIgnite();
  useOverlayPermissionPrompt();

  const themePickerRef = useRef<PickerSheetHandle>(null);
  const fontPickerRef = useRef<PickerSheetHandle>(null);

  // 기본 명언: 앱에 번들된 전체 명언 + 동기화로 추가된 명언
  const [defaultQuotes, setDefaultQuotes] = useState<Quote[]>(bundledQuotes);

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [pager, setPager] = useState<QuotePager>(createPager);
  // 다른 필터 모드로 전환했다 돌아올 때 보던 위치를 복원하기 위한 저장소
  const savedPagers = useRef<Record<FilterMode, QuotePager>>({
    all: createPager(),
    mine: createPager(),
    favorites: createPager(),
  });

  // ── 추가 명언 로드 ─────────────────────────────────────────
  // 번들 명언으로 바로 시작하고, 이전에 동기화한 명언과 서버의 새 명언을 뒤에 덧붙인다.
  useEffect(() => {
    const appendQuotes = (extra: Quote[]) => {
      if (extra.length === 0) return;
      setDefaultQuotes((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        return [...prev, ...extra.filter((q) => !existingIds.has(q.id))];
      });
    };
    (async () => {
      appendQuotes(await loadSyncedQuotes());
      appendQuotes(await syncNewQuotes());
      AsyncStorage.removeItem(LEGACY_QUOTE_CACHE_KEY);
    })();
  }, []);

  // 첫 명언 풀을 만든다. (명언이 추가되어도 보던 위치는 유지)
  useEffect(() => {
    setPager((prev) => (prev.quotes.length > 0 ? prev : createPager(buildPool(filterMode))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQuotes]);

  // 즐겨찾기한 명언 목록 (즐겨찾기한 순서)
  // 저장해 둔 favoritesData를 우선 사용하고, id만 저장된 예전 즐겨찾기는 현재 명언 목록에서 보충한다.
  const getFavoriteQuotes = (): Quote[] => {
    const byId = new Map<string, Quote>();
    (favoritesData || []).forEach((q) => byId.set(q.id, q));
    [...defaultQuotes, ...customQuotes].forEach((q) => {
      if (!byId.has(q.id)) byId.set(q.id, q);
    });
    return favorites.map((id) => byId.get(id)).filter((q): q is Quote => !!q);
  };

  // ── buildPool ─────────────────────────────────────────────
  // 필터 모드에 맞는 명언 풀을 무작위 순서로 만든다.
  //   - 'all': 기본 + 커스텀 명언 중 무작위 50개
  //   - 'mine': 커스텀 명언 전체
  //   - 'favorites': 즐겨찾기한 명언 전체
  const buildPool = (mode: FilterMode): Quote[] => {
    switch (mode) {
      case "mine":
        return shuffle(customQuotes);
      case "favorites":
        return shuffle(getFavoriteQuotes());
      case "all":
        return shuffle([...defaultQuotes, ...customQuotes]).slice(0, QUOTE_BATCH_SIZE);
    }
  };

  // ── syncPager ─────────────────────────────────────────────
  // 보고 있던 목록을 최신 상태에 맞춘다. (보던 명언 위치는 최대한 유지)
  //   - 수정된 나만의 명언은 새 내용으로, 삭제된 명언은 목록에서 뺀다.
  //   - 'favorites': 즐겨찾기 해제된 명언은 빼고, 새로 즐겨찾기한 명언은 뒤에 붙인다.
  //   - 'mine': 새로 작성한 명언을 뒤에 붙인다.
  const syncPager = (pager: QuotePager, mode: FilterMode): QuotePager => {
    const latestCustom = new Map(customQuotes.map((q) => [q.id, q]));
    const favoriteIds = new Set(favorites);

    const kept: Quote[] = [];
    let removedBeforeCurrent = 0;
    let removedBeforeMax = 0;
    pager.quotes.forEach((quote, index) => {
      const latest = isCustomQuoteId(quote.id) ? latestCustom.get(quote.id) : quote;
      const removed = !latest || (mode === "favorites" && !favoriteIds.has(quote.id));
      if (removed) {
        if (index < pager.currentIndex) removedBeforeCurrent++;
        if (index < pager.maxIndex) removedBeforeMax++;
        return;
      }
      kept.push(latest);
    });

    const keptIds = new Set(kept.map((q) => q.id));
    const source = mode === "mine" ? customQuotes : mode === "favorites" ? getFavoriteQuotes() : [];
    const added = source.filter((q) => !keptIds.has(q.id));
    const quotes = [...kept, ...added];

    const unchanged =
      quotes.length === pager.quotes.length && quotes.every((q, i) => q === pager.quotes[i]);
    if (unchanged) return pager;

    const lastIndex = Math.max(quotes.length - 1, 0);
    return {
      quotes,
      currentIndex: Math.min(pager.currentIndex - removedBeforeCurrent, lastIndex),
      maxIndex: Math.min(pager.maxIndex - removedBeforeMax, lastIndex),
    };
  };

  // 저장해 둔 모드별 위치를 복원한다. 처음 보는 모드거나 비어 있으면 새 풀을 만든다.
  const restorePager = (mode: FilterMode): QuotePager => {
    const synced = syncPager(savedPagers.current[mode], mode);
    return synced.quotes.length > 0 ? synced : createPager(buildPool(mode));
  };

  // 나만의 명언/즐겨찾기가 바뀌면 보고 있던 목록에 바로 반영한다.
  // 현재 모드에 보여줄 명언이 하나도 남지 않으면 전체 모드로 돌아간다.
  useEffect(() => {
    (Object.keys(savedPagers.current) as FilterMode[]).forEach((mode) => {
      if (mode !== filterMode) savedPagers.current[mode] = syncPager(savedPagers.current[mode], mode);
    });

    const synced = syncPager(pager, filterMode);
    if (synced === pager) return;
    if (filterMode !== "all" && synced.quotes.length === 0) {
      savedPagers.current[filterMode] = createPager();
      setPager(restorePager("all"));
      setFilterMode("all");
      return;
    }
    setPager(synced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customQuotes, favorites, favoritesData]);

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
  // '전체' 모드에서 목록 끝에 가까워지면 로컬 명언에서 더 뽑아 뒤에 붙인다.
  const loadMoreQuotes = () => {
    if (filterMode !== "all") return;

    setPager((prev) => {
      const existingIds = new Set(prev.quotes.map((q) => q.id));
      const candidates = [...defaultQuotes, ...customQuotes].filter((q) => !existingIds.has(q.id));
      return { ...prev, quotes: [...prev.quotes, ...shuffle(candidates).slice(0, QUOTE_BATCH_SIZE)] };
    });
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

      {/* 불씨를 직접 켜는 오버레이. 오늘 아직 점화하지 않았을 때만 표시 */}
      {!isIgnited && <IgniteScreen onIgnited={markIgnited} />}
    </SafeAreaView>
  );
}

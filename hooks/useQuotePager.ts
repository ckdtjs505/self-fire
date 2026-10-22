// ─────────────────────────────────────────────────────────────
// useQuotePager.ts
// 홈 화면에서 넘겨 보는 명언 목록(페이저)의 상태와 규칙.
//   - 필터 모드: 전체 / 내가 쓴 명언 / 즐겨찾기 (모드별로 보던 위치 유지, 수정·삭제 즉시 반영)
//   - 카테고리: '전체' 모드에서 고른 카테고리의 명언만 보여준다
//   - 명언 풀(pool): 50개씩 샘플링(첫 50개는 날짜 시드로 고정 = 오늘의 명언)
//   - 알림을 눌러 들어오면 그 알림의 명언을 맨 앞에 보여 준다
// 목록 계산 자체는 data/quote-pager.ts의 순수 함수가 한다.
// ─────────────────────────────────────────────────────────────

import { CategorySelection } from "@/components/category-tabs";
import { getAllModeCandidates, orderQuotesForDay, pinTodayQuote } from "@/data/daily-quote";
import { QUOTE_BATCH_SIZE } from "@/data/quote-api";
import { CategoryId } from "@/data/quote-categories";
import { createPager, FilterMode, getFavoriteQuotes, QuotePager, syncPager } from "@/data/quote-pager";
import { Quote } from "@/models";
import { useCategoryStore } from "@/store/category";
import { usePendingQuoteStore } from "@/store/notification";
import { useFavoriteQuoteStore } from "@/store/quote";
import { shuffle } from "@/utils/shuffle";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { useShallow } from "zustand/react/shallow";

type Options = {
  // 기본 명언 (번들 + 동기화, hooks/useDefaultQuotes.ts)
  defaultQuotes: Quote[];
  // 바뀔 때마다 저장한 문장을 연다 (사이드바·저장한 문장 목록이 넘기는 값)
  openFavoritesKey?: string;
  // 저장한 문장을 열 때 먼저 보여 줄 명언 (저장한 문장 목록에서 누른 명언)
  openQuoteId?: string;
  // 다음 명언으로 넘겼을 때 (넘기기 힌트 끄기 등)
  onNext?: () => void;
  // 오늘 고른 문장. '전체' 목록을 만들 때 맨 앞에 두어, 앱을 다시 켜도 오늘의 문장부터 보인다.
  todayQuote?: Quote | null;
};

export const useQuotePager = ({ defaultQuotes, openFavoritesKey, openQuoteId, onNext, todayQuote }: Options) => {
  const { customQuotes, favorites, favoritesData } = useFavoriteQuoteStore(
    useShallow((s) => ({
      customQuotes: s.customQuotes,
      favorites: s.favorites,
      favoritesData: s.favoritesData,
    }))
  );
  const { currentCategoryId, updateCategoryId, interestIds } = useCategoryStore(
    useShallow((s) => ({
      currentCategoryId: s.currentCategoryId,
      updateCategoryId: s.updateCategoryId,
      interestIds: s.interestIds,
    }))
  );
  const [isCategoryHydrated, setIsCategoryHydrated] = useState(useCategoryStore.persist.hasHydrated());
  // 알림을 눌러 앱을 열었으면 그 알림의 명언 (app/_layout.tsx에서 넣어 준다)
  const pendingQuote = usePendingQuoteStore((s) => s.quote);

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [pager, setPager] = useState<QuotePager>(createPager);
  // 다른 필터 모드로 전환했다 돌아올 때 보던 위치를 복원하기 위한 저장소
  const savedPagers = useRef<Record<FilterMode, QuotePager>>({
    all: createPager(),
    mine: createPager(),
    favorites: createPager(),
  });

  const favoriteQuotes = () => getFavoriteQuotes(favorites, favoritesData, [...defaultQuotes, ...customQuotes]);
  const sync = (target: QuotePager, mode: FilterMode) =>
    syncPager(target, mode, { customQuotes, favorites, favoriteQuotes: favoriteQuotes() });

  // '전체' 모드의 후보 명언 (기본 + 커스텀, data/daily-quote.ts 참고)
  const getCandidates = (categoryId: CategoryId | null = currentCategoryId): Quote[] =>
    getAllModeCandidates([...defaultQuotes, ...customQuotes], categoryId, new Set(favorites), interestIds);

  // ── buildPool ─────────────────────────────────────────────
  // 필터 모드에 맞는 명언 풀을 무작위 순서로 만든다.
  //   - 'all': 기본 + 커스텀 명언 중 (카테고리에 맞는) 50개. 오늘 날짜를 시드로 섞어서
  //            같은 날에는 앱을 다시 실행해도 첫 명언(오늘의 명언)과 순서가 같다.
  //   - 'mine': 커스텀 명언 전체
  //   - 'favorites': 즐겨찾기한 명언 전체
  // 'all'은 오늘 따르는 문장이 있으면 고른 주제와 상관없이 맨 앞에 둔다.
  const buildPool = (mode: FilterMode, categoryId: CategoryId | null = currentCategoryId): Quote[] => {
    switch (mode) {
      case "mine":
        return shuffle(customQuotes);
      case "favorites":
        return shuffle(favoriteQuotes());
      case "all": {
        const candidates = getCandidates(categoryId);
        return pinTodayQuote(orderQuotesForDay(candidates).slice(0, QUOTE_BATCH_SIZE), todayQuote);
      }
    }
  };

  // 첫 명언 풀을 만든다. (명언이 추가되어도 보던 위치는 유지)
  useEffect(() => {
    setPager((prev) => (prev.quotes.length > 0 ? prev : createPager(buildPool(filterMode))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultQuotes]);

  // 저장해 둔 모드별 위치를 복원한다. 처음 보는 모드거나 비어 있으면 새 풀을 만든다.
  const restorePager = (mode: FilterMode): QuotePager => {
    const synced = sync(savedPagers.current[mode], mode);
    return synced.quotes.length > 0 ? synced : createPager(buildPool(mode));
  };

  // 나만의 명언/즐겨찾기가 바뀌면 보고 있던 목록에 바로 반영한다.
  // 현재 모드에 보여줄 명언이 하나도 남지 않으면 전체 모드로 돌아간다.
  useEffect(() => {
    (Object.keys(savedPagers.current) as FilterMode[]).forEach((mode) => {
      if (mode !== filterMode) savedPagers.current[mode] = sync(savedPagers.current[mode], mode);
    });

    const synced = sync(pager, filterMode);
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

  // 카테고리를 바꾸면 '전체' 모드 목록을 새로 만들고 '전체' 모드로 전환한다.
  const changeCategory = (categoryId: CategoryId | null) => {
    if (filterMode !== "all") savedPagers.current[filterMode] = pager;
    savedPagers.current.all = createPager();
    setPager(createPager(buildPool("all", categoryId)));
    setFilterMode("all");
    updateCategoryId(categoryId);
  };

  // 저장된 카테고리를 늦게 불러오면 첫 명언 풀을 그 카테고리로 다시 만든다.
  // (관심 주제는 아래 effect가 다시 만든다)
  useEffect(() => {
    const rebuild = (categoryId: CategoryId | null) => {
      if (categoryId) setPager(createPager(buildPool("all", categoryId)));
    };
    // 첫 렌더와 이 effect 사이에 불러오기가 끝났으면 바로 반영한다.
    const hydrated = useCategoryStore.getState().currentCategoryId;
    if (useCategoryStore.persist.hasHydrated() && hydrated !== currentCategoryId) rebuild(hydrated);
    return useCategoryStore.persist.onFinishHydration((state) => {
      setIsCategoryHydrated(true);
      rebuild(state.currentCategoryId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 관심 주제가 바뀌면(불러오기·주제 고르기·설정) '전체' 목록을 새로 만들고 '전체' 모드로 돌아간다.
  const prevInterestKey = useRef(interestIds.join(","));
  useEffect(() => {
    const key = interestIds.join(",");
    if (key === prevInterestKey.current) return;
    prevInterestKey.current = key;
    savedPagers.current.all = createPager();
    if (filterMode !== "all") savedPagers.current[filterMode] = pager;
    setPager(createPager(buildPool("all")));
    setFilterMode("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interestIds]);

  // 카테고리 탭에서 고른 항목: 저장한 문장·내 명언이면 그 모드로, 아니면 그 카테고리의 전체 모드로 전환한다.
  const selectCategory = (selection: CategorySelection) => {
    if (selection === "favorites" || selection === "mine") {
      if (filterMode === selection) return;
      const isEmpty = selection === "favorites" ? favorites.length === 0 : customQuotes.length === 0;
      if (isEmpty) {
        Toast.show({
          type: "info",
          text1: "알림",
          text2:
            selection === "favorites"
              ? "아직 저장한 문장이 없습니다. 마음에 와닿는 문장을 저장해 보세요!"
              : "아직 직접 작성한 명언이 없습니다. 명언을 먼저 등록해 보세요!",
        });
        return;
      }
      changeFilterMode(selection);
      return;
    }
    if (filterMode === "all" && selection === currentCategoryId) return;
    changeCategory(selection);
  };

  // 저장한 문장 목록에서 누른 명언부터 보여 준다. 목록과 같은 최근 저장순으로 이어서 넘길 수 있다.
  const openFavoriteAt = (id: string) => {
    const quotes = [...favoriteQuotes()].reverse();
    const index = quotes.findIndex((q) => q.id === id);
    if (index < 0) {
      selectCategory("favorites");
      return;
    }
    if (filterMode !== "favorites") savedPagers.current[filterMode] = pager;
    setPager({ quotes, currentIndex: index, maxIndex: index });
    setFilterMode("favorites");
  };

  useEffect(() => {
    if (!openFavoritesKey) return;
    if (openQuoteId) openFavoriteAt(openQuoteId);
    else selectCategory("favorites");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFavoritesKey]);

  // 알림(또는 사이드바의 오늘 따르는·따라 산 문장)의 명언을 맨 앞에 두고 '전체' 목록을 이어 붙인다.
  // 저장된 카테고리·관심 주제로 목록을 다시 만드는 effect들보다 뒤에 두어, 불러오기가 끝난 뒤 덮어쓴다.
  useEffect(() => {
    if (!pendingQuote || !isCategoryHydrated) return;
    usePendingQuoteStore.getState().setQuote(null);
    if (filterMode !== "all") savedPagers.current[filterMode] = pager;
    const rest = buildPool("all").filter((q) => q.id !== pendingQuote.id);
    setPager(createPager([pendingQuote, ...rest]));
    setFilterMode("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuote, isCategoryHydrated]);

  // ── loadMoreQuotes ────────────────────────────────────────
  // '전체' 모드에서 목록 끝에 가까워지면 로컬 명언에서 더 뽑아 뒤에 붙인다.
  const loadMoreQuotes = () => {
    if (filterMode !== "all") return;

    setPager((prev) => {
      const existingIds = new Set(prev.quotes.map((q) => q.id));
      const candidates = getCandidates().filter((q) => !existingIds.has(q.id));
      return { ...prev, quotes: [...prev.quotes, ...shuffle(candidates).slice(0, QUOTE_BATCH_SIZE)] };
    });
  };

  // ── 이전/다음 명언 ─────────────────────────────────────────
  const showNextQuote = () => {
    const { quotes, currentIndex } = pager;
    if (quotes.length === 0) return;
    onNext?.();

    // 내 명언·저장한 문장은 마지막 명언에서 멈춘다. 전체 모드는 끝까지 보면 처음으로 돌아간다.
    if (filterMode !== "all" && currentIndex + 1 >= quotes.length) return;
    const nextIndex = currentIndex + 1 >= quotes.length ? 0 : currentIndex + 1;
    if (nextIndex >= quotes.length - 2) loadMoreQuotes();

    setPager((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      maxIndex: Math.max(prev.maxIndex, nextIndex),
    }));
  };

  const showLatestQuote = () => {
    setPager((prev) => ({ ...prev, currentIndex: prev.maxIndex }));
  };

  const showPrevQuote = () => {
    setPager((prev) => ({ ...prev, currentIndex: Math.max(prev.currentIndex - 1, 0) }));
  };

  const currentQuote: Quote | undefined = pager.quotes[pager.currentIndex];

  return {
    filterMode,
    // 카테고리 탭에서 선택된 항목
    selectedId: (filterMode === "all" ? currentCategoryId : filterMode) as CategorySelection,
    currentQuote,
    currentIndex: pager.currentIndex,
    maxIndex: pager.maxIndex,
    // 내 명언·저장한 문장은 정해진 목록이라 마지막 명언 다음으로는 넘기지 않는다.
    canGoNext: filterMode === "all" ? pager.quotes.length > 1 : pager.currentIndex < pager.quotes.length - 1,
    canGoPrev: pager.currentIndex > 0,
    isCategoryHydrated,
    selectCategory,
    showNextQuote,
    showPrevQuote,
    showLatestQuote,
  };
};

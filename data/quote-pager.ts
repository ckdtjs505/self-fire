// ─────────────────────────────────────────────────────────────
// quote-pager.ts
// 홈 화면에서 넘겨 보는 명언 목록(페이저) 계산. 화면 상태와 무관한 순수 함수만 둔다.
// 상태와 effect는 hooks/useQuotePager.ts에 있다.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";

export type FilterMode = "all" | "mine" | "favorites";

// 한 필터 모드에서 보고 있는 명언 목록과 위치
export type QuotePager = {
  quotes: Quote[];
  currentIndex: number;
  // 이번 세션에서 가장 멀리 진행한 인덱스 ('이전에 본 명언' 뱃지 표시용)
  maxIndex: number;
};

export const createPager = (quotes: Quote[] = []): QuotePager => ({ quotes, currentIndex: 0, maxIndex: 0 });

// 사용자가 직접 작성한 명언의 id (store/quote.ts의 addCustomQuote 참고)
export const isCustomQuoteId = (id: string) => id.startsWith("custom-");

// 즐겨찾기한 명언 목록 (즐겨찾기한 순서)
// 저장해 둔 favoritesData를 우선 사용하고, id만 저장된 예전 즐겨찾기는 현재 명언 목록에서 보충한다.
export const getFavoriteQuotes = (favorites: string[], favoritesData: Quote[] | undefined, allQuotes: Quote[]): Quote[] => {
  const byId = new Map<string, Quote>();
  (favoritesData || []).forEach((q) => byId.set(q.id, q));
  allQuotes.forEach((q) => {
    if (!byId.has(q.id)) byId.set(q.id, q);
  });
  return favorites.map((id) => byId.get(id)).filter((q): q is Quote => !!q);
};

export type PagerSources = {
  customQuotes: Quote[];
  favorites: string[];
  // 즐겨찾기한 명언 목록 (getFavoriteQuotes 결과)
  favoriteQuotes: Quote[];
};

// ── syncPager ─────────────────────────────────────────────
// 보고 있던 목록을 최신 상태에 맞춘다. (보던 명언 위치는 최대한 유지)
//   - 수정된 나만의 명언은 새 내용으로, 삭제된 명언은 목록에서 뺀다.
//   - 'favorites': 즐겨찾기 해제된 명언은 빼고, 새로 즐겨찾기한 명언은 뒤에 붙인다.
//   - 'mine': 새로 작성한 명언을 뒤에 붙인다.
//   - 'all': 아직 보지 않은 명언 중 즐겨찾기된 것은 뺀다. (즐겨찾기를 늦게 불러온 경우 대비)
// 바뀐 것이 없으면 받은 pager를 그대로 돌려준다.
export const syncPager = (pager: QuotePager, mode: FilterMode, sources: PagerSources): QuotePager => {
  const { customQuotes, favorites, favoriteQuotes } = sources;
  const latestCustom = new Map(customQuotes.map((q) => [q.id, q]));
  const favoriteIds = new Set(favorites);

  const kept: Quote[] = [];
  let removedBeforeCurrent = 0;
  let removedBeforeMax = 0;
  pager.quotes.forEach((quote, index) => {
    const latest = isCustomQuoteId(quote.id) ? latestCustom.get(quote.id) : quote;
    const removed =
      !latest ||
      (mode === "favorites" && !favoriteIds.has(quote.id)) ||
      (mode === "all" && index > pager.maxIndex && favoriteIds.has(quote.id));
    if (removed) {
      if (index < pager.currentIndex) removedBeforeCurrent++;
      if (index < pager.maxIndex) removedBeforeMax++;
      return;
    }
    kept.push(latest);
  });

  const keptIds = new Set(kept.map((q) => q.id));
  const source = mode === "mine" ? customQuotes : mode === "favorites" ? favoriteQuotes : [];
  const added = source.filter((q) => !keptIds.has(q.id));
  const quotes = [...kept, ...added];

  const unchanged = quotes.length === pager.quotes.length && quotes.every((q, i) => q === pager.quotes[i]);
  if (unchanged) return pager;

  const lastIndex = Math.max(quotes.length - 1, 0);
  return {
    quotes,
    currentIndex: Math.min(pager.currentIndex - removedBeforeCurrent, lastIndex),
    maxIndex: Math.min(pager.maxIndex - removedBeforeMax, lastIndex),
  };
};

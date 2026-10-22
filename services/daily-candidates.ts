// ─────────────────────────────────────────────────────────────
// daily-candidates.ts
// '오늘의 명언' 후보 목록. 알림 예약과 홈 화면 위젯이 함께 쓴다.
// 홈 화면 '전체' 모드와 같은 후보여야 알림 명언과 그날 홈 화면의 첫 명언이 같아진다.
// ─────────────────────────────────────────────────────────────

import { getAllModeCandidates } from "@/data/daily-quote";
import { quotes as bundledQuotes, loadSyncedQuotes } from "@/data/quotes";
import { Quote } from "@/models";
import { useCategoryStore } from "@/store/category";
import { selectTodayQuote, useDeedStore } from "@/store/deed";
import { useFavoriteQuoteStore } from "@/store/quote";
import { waitForHydration } from "@/utils/hydration";

// 오늘 따르는 문장(오늘 고른 문장). 알림·위젯이 오늘 날짜에 '오늘의 명언' 대신 보여 준다.
// 홈 화면 첫 명언과 같이 고른 주제와 상관없이 쓴다. (data/daily-quote.ts의 pinTodayQuote)
export async function loadTodayPick(): Promise<Quote | null> {
  await waitForHydration(useDeedStore);
  return selectTodayQuote(useDeedStore.getState());
}

// 기본 + 동기화된 명언 + 나만의 명언, 카테고리·즐겨찾기 반영
export async function loadDailyCandidates(): Promise<Quote[]> {
  await Promise.all([waitForHydration(useFavoriteQuoteStore), waitForHydration(useCategoryStore)]);
  const synced = await loadSyncedQuotes();
  const bundledIds = new Set(bundledQuotes.map((q) => q.id));
  const { customQuotes, favorites } = useFavoriteQuoteStore.getState();
  const all = [...bundledQuotes, ...synced.filter((q) => !bundledIds.has(q.id)), ...customQuotes];
  const { currentCategoryId, interestIds } = useCategoryStore.getState();
  return getAllModeCandidates(all, currentCategoryId, new Set(favorites), interestIds);
}

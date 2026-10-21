// ─────────────────────────────────────────────────────────────
// data/daily-quote.ts
// '오늘의 명언' 계산. 홈 화면의 첫 명언과 알림 명언이 같은 규칙을 쓰도록 한곳에 모아 둔다.
// ─────────────────────────────────────────────────────────────

import { CategoryId, matchesCategory } from "@/data/quote-categories";
import { Quote } from "@/models";
import { toDateString } from "@/utils/date";
import { seededShuffle } from "@/utils/shuffle";

// '전체' 모드의 후보 명언: 고른 카테고리에 속하고, 불씨를 지피지(즐겨찾기) 않은 것
//   - 카테고리를 고르지 않았으면(전체) 관심 주제(온보딩에서 고른 주제) 중 하나라도 속하는 명언
//   - 관심 주제가 없거나 맞는 명언이 없으면 모든 명언
// 카테고리의 명언을 모두 즐겨찾기했다면 즐겨찾기한 명언도 그대로 후보로 쓴다.
export const getAllModeCandidates = (
  all: Quote[],
  categoryId: CategoryId | null,
  favoriteIds: Set<string>,
  interestIds: CategoryId[] = [],
): Quote[] => {
  const inCategory = categoryId
    ? all.filter((q) => matchesCategory(q, categoryId))
    : filterByInterests(all, interestIds);
  const notFavorited = inCategory.filter((q) => !favoriteIds.has(q.id));
  return notFavorited.length > 0 ? notFavorited : inCategory;
};

const filterByInterests = (all: Quote[], interestIds: CategoryId[]): Quote[] => {
  if (interestIds.length === 0) return all;
  const matched = all.filter((q) => interestIds.some((id) => matchesCategory(q, id)));
  return matched.length > 0 ? matched : all;
};

// 날짜를 시드로 섞는다. 같은 날에는 항상 같은 순서이고, 맨 앞이 그날의 '오늘의 명언'이다.
// 오늘의 명언은 대표 명언(featured) 중에서 고른다. 후보에 대표 명언이 없으면(예전 번들 등) 섞인 순서 그대로.
export const orderQuotesForDay = (quotes: Quote[], date: Date = new Date()): Quote[] => {
  const shuffled = seededShuffle(quotes, toDateString(date), (q) => q.id);
  const firstFeatured = shuffled.findIndex((q) => q.featured);
  if (firstFeatured <= 0) return shuffled;
  return [shuffled[firstFeatured], ...shuffled.slice(0, firstFeatured), ...shuffled.slice(firstFeatured + 1)];
};

export const getDailyQuote = (quotes: Quote[], date: Date = new Date()): Quote | undefined =>
  orderQuotesForDay(quotes, date)[0];

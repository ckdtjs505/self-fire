// ─────────────────────────────────────────────────────────────
// quote-search.ts
// 보관함·내 명언 목록에서 쓰는 명언 검색. 화면 상태와 무관한 순수 함수만 둔다.
//   - 내용과 작성자를 함께 찾는다.
//   - 띄어쓰기와 대소문자는 무시한다. ("포기하지마" → "포기하지 마")
//   - 검색어를 띄어 쓰면 모든 낱말이 들어 있는 명언만 남긴다. ("실패 처칠")
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, "");

// 검색어를 낱말로 나눈다. 비어 있으면 빈 배열
export const toSearchTerms = (query: string): string[] =>
  query
    .split(/\s+/)
    .map(normalize)
    .filter((term) => term.length > 0);

// 검색어에 맞는 명언만 원래 순서대로 돌려준다. 검색어가 비어 있으면 그대로 돌려준다.
export const searchQuotes = (quotes: Quote[], query: string): Quote[] => {
  const terms = toSearchTerms(query);
  if (terms.length === 0) return quotes;
  return quotes.filter((quote) => {
    const haystack = normalize(`${quote.text}${quote.author}`);
    return terms.every((term) => haystack.includes(term));
  });
};

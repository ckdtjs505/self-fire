import { CATEGORIES, matchesCategory } from "@/data/quote-categories";

const q = (text: string) => ({ id: "1", text, author: "a" });

describe("matchesCategory", () => {
  it("키워드로 카테고리를 분류한다", () => {
    expect(matchesCategory(q("성공은 끝이 아니다."), "success")).toBe(true);
    expect(matchesCategory(q("좋은 책은 좋은 친구다."), "wisdom")).toBe(true);
    expect(matchesCategory(q("좋은 책은 좋은 친구다."), "relation")).toBe(true);
  });

  it("비슷한 낱말에는 걸리지 않는다", () => {
    expect(matchesCategory(q("책임을 다하라."), "wisdom")).toBe(false);
    expect(matchesCategory(q("단단한 방책을 쌓아라."), "wisdom")).toBe(false);
    expect(matchesCategory(q("꿈틀거리는 벌레."), "success")).toBe(false);
  });

  it("성경은 출처(작가)로 분류한다", () => {
    const b = (author: string) => matchesCategory({ id: "1", text: "구하라 그러면 주실 것이다.", author }, "bible");
    expect(b("『신약성서』 마태복음 7.7")).toBe(true);
    expect(b("성경 잠언")).toBe(true);
    expect(b("잠언 17장 22절")).toBe(true);
    expect(b("예수 그리스도")).toBe(true);
    expect(b("이성경")).toBe(false);
    expect(b("유럽의 잠언")).toBe(false);
    expect(b("히브리 격언")).toBe(false);
  });

  it("카테고리 id가 겹치지 않는다", () => {
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length);
  });
});

describe("matchesCategory — 서버 categories", () => {
  it("categories가 있으면 키워드보다 우선한다", () => {
    const quote = { id: "1", text: "성공은 끝이 아니다", author: "작가", categories: ["love"] };
    expect(matchesCategory(quote, "love")).toBe(true);
    expect(matchesCategory(quote, "success")).toBe(false);
  });

  it("categories가 null이면 키워드로 분류한다", () => {
    expect(matchesCategory({ id: "1", text: "성공은 끝이 아니다", author: "작가", categories: null }, "success")).toBe(true);
  });
});

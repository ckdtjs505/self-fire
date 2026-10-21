import { getAllModeCandidates, getDailyQuote, orderQuotesForDay } from "@/data/daily-quote";
import { Quote } from "@/models";

const q = (id: string, text: string): Quote => ({ id, text, author: "작가" });

const quotes: Quote[] = [
  q("1", "성공은 끝이 아니다"), // success
  q("2", "용기는 두려움을 이기는 것"), // courage
  q("3", "사랑은 오래 참고"), // love
  q("4", "오늘 점심은 김밥"), // 어느 주제에도 없음
];

const ids = (list: Quote[]) => list.map((x) => x.id);

describe("getAllModeCandidates — 관심 주제", () => {
  it("관심 주제가 없으면 모든 명언", () => {
    expect(ids(getAllModeCandidates(quotes, null, new Set()))).toEqual(["1", "2", "3", "4"]);
  });

  it("관심 주제 중 하나라도 속하는 명언만", () => {
    expect(ids(getAllModeCandidates(quotes, null, new Set(), ["success", "courage"]))).toEqual(["1", "2"]);
  });

  it("카테고리를 고르면 관심 주제보다 카테고리가 우선", () => {
    expect(ids(getAllModeCandidates(quotes, "love", new Set(), ["success"]))).toEqual(["3"]);
  });

  it("관심 주제에 맞는 명언이 없으면 모든 명언", () => {
    expect(ids(getAllModeCandidates(quotes, null, new Set(), ["bible"]))).toEqual(["1", "2", "3", "4"]);
  });

  it("즐겨찾기한 명언은 빼되, 다 즐겨찾기했으면 그대로", () => {
    expect(ids(getAllModeCandidates(quotes, null, new Set(["1"]), ["success", "courage"]))).toEqual(["2"]);
    expect(ids(getAllModeCandidates(quotes, null, new Set(["1", "2"]), ["success", "courage"]))).toEqual(["1", "2"]);
  });
});

describe("orderQuotesForDay — 대표 명언", () => {
  const many: Quote[] = Array.from({ length: 30 }, (_, i) => ({ ...q(String(i + 1), `명언 ${i + 1}`), featured: i % 10 === 9 }));
  const day = (d: number) => new Date(2026, 9, d);

  it("오늘의 명언(맨 앞)은 항상 featured 명언이고, 나머지 순서는 유지된다", () => {
    for (let d = 1; d <= 20; d++) {
      const ordered = orderQuotesForDay(many, day(d));
      expect(ordered[0].featured).toBe(true);
      expect(getDailyQuote(many, day(d))).toBe(ordered[0]);
      expect(ids(ordered).sort()).toEqual(ids(many).sort());
    }
  });

  it("featured 명언이 없으면 섞인 순서 그대로", () => {
    const plain = many.map(({ featured, ...rest }) => rest);
    expect(getDailyQuote(plain, day(1))).toBeDefined();
  });
});

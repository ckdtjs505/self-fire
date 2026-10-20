import { getAllModeCandidates } from "@/data/daily-quote";
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

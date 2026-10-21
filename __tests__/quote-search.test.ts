import { searchQuotes, toSearchTerms } from "@/data/quote-search";
import { Quote } from "@/models";

const quotes: Quote[] = [
  { id: "1", text: "포기하지 마라. 위대한 일은 시간이 걸린다.", author: "윈스턴 처칠" },
  { id: "2", text: "실패는 성공의 어머니다.", author: "토머스 에디슨" },
  { id: "3", text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
];

describe("searchQuotes", () => {
  it("검색어가 비어 있으면 그대로 돌려준다", () => {
    expect(searchQuotes(quotes, "")).toBe(quotes);
    expect(searchQuotes(quotes, "   ")).toBe(quotes);
  });

  it("내용과 작성자로 찾는다", () => {
    expect(searchQuotes(quotes, "실패").map((q) => q.id)).toEqual(["2"]);
    expect(searchQuotes(quotes, "처칠").map((q) => q.id)).toEqual(["1"]);
  });

  it("띄어쓰기와 대소문자를 무시한다", () => {
    expect(searchQuotes(quotes, "포기하지마").map((q) => q.id)).toEqual(["1"]);
    expect(searchQuotes(quotes, "STEVE").map((q) => q.id)).toEqual(["3"]);
  });

  it("여러 낱말은 모두 들어 있어야 한다", () => {
    expect(searchQuotes(quotes, "위대한 처칠").map((q) => q.id)).toEqual(["1"]);
    expect(searchQuotes(quotes, "위대한 에디슨")).toEqual([]);
  });

  it("검색어를 낱말로 나눈다", () => {
    expect(toSearchTerms("  Stay  Hungry ")).toEqual(["stay", "hungry"]);
  });
});

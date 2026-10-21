import { createPager, getFavoriteQuotes, QuotePager, syncPager } from "@/data/quote-pager";
import { Quote } from "@/models";

const q = (id: string, text = `명언 ${id}`): Quote => ({ id, text, author: "" });
const pagerOf = (quotes: Quote[], currentIndex: number, maxIndex = currentIndex): QuotePager => ({
  quotes,
  currentIndex,
  maxIndex,
});
const sources = (over: Partial<Parameters<typeof syncPager>[2]> = {}) => ({
  customQuotes: [],
  favorites: [],
  favoriteQuotes: [],
  ...over,
});

describe("getFavoriteQuotes", () => {
  it("즐겨찾기한 순서대로, 저장된 내용을 우선해 돌려준다", () => {
    const saved = q("2", "저장된 내용");
    expect(getFavoriteQuotes(["2", "1", "9"], [saved], [q("1"), q("2", "현재 내용")])).toEqual([saved, q("1")]);
  });

  it("favoritesData가 없던 예전 데이터도 현재 명언 목록에서 보충한다", () => {
    expect(getFavoriteQuotes(["1"], undefined, [q("1")])).toEqual([q("1")]);
  });
});

describe("syncPager", () => {
  it("바뀐 것이 없으면 같은 객체를 돌려준다", () => {
    const pager = pagerOf([q("1"), q("2")], 1);
    expect(syncPager(pager, "all", sources())).toBe(pager);
  });

  it("수정된 나만의 명언은 새 내용으로 바꾸고, 삭제된 명언은 빼며 위치를 유지한다", () => {
    const edited = q("custom-2", "고친 내용");
    const pager = pagerOf([q("custom-1"), q("custom-2"), q("custom-3")], 2);
    const synced = syncPager(pager, "mine", sources({ customQuotes: [edited, q("custom-3")] }));
    expect(synced.quotes).toEqual([edited, q("custom-3")]);
    // 앞의 명언 하나가 빠졌으므로 보던 명언(custom-3)을 계속 가리킨다
    expect(synced.quotes[synced.currentIndex].id).toBe("custom-3");
  });

  it("'mine' 모드에서는 새로 작성한 명언을 뒤에 붙인다", () => {
    const pager = pagerOf([q("custom-1")], 0);
    const synced = syncPager(pager, "mine", sources({ customQuotes: [q("custom-1"), q("custom-2")] }));
    expect(synced.quotes.map((x) => x.id)).toEqual(["custom-1", "custom-2"]);
    expect(synced.currentIndex).toBe(0);
  });

  it("'favorites' 모드에서는 해제된 명언을 빼고 새 즐겨찾기를 뒤에 붙인다", () => {
    const pager = pagerOf([q("1"), q("2")], 1);
    const synced = syncPager(pager, "favorites", sources({ favorites: ["2", "3"], favoriteQuotes: [q("2"), q("3")] }));
    expect(synced.quotes.map((x) => x.id)).toEqual(["2", "3"]);
    expect(synced.currentIndex).toBe(0);
  });

  it("'all' 모드에서는 아직 보지 않은 명언 중 즐겨찾기된 것만 뺀다", () => {
    const pager = pagerOf([q("1"), q("2"), q("3"), q("4")], 1);
    const synced = syncPager(pager, "all", sources({ favorites: ["1", "3"] }));
    // 이미 본 1은 남고, 아직 안 본 3은 빠진다
    expect(synced.quotes.map((x) => x.id)).toEqual(["1", "2", "4"]);
    expect(synced.currentIndex).toBe(1);
  });

  it("목록이 줄어도 위치가 범위를 넘지 않는다", () => {
    const pager = pagerOf([q("1"), q("2"), q("3")], 2);
    const synced = syncPager(pager, "favorites", sources({ favorites: ["1"], favoriteQuotes: [q("1")] }));
    expect(synced).toEqual(pagerOf([q("1")], 0));
  });

  it("빈 목록이 되면 위치는 0", () => {
    const synced = syncPager(pagerOf([q("custom-1")], 0), "mine", sources());
    expect(synced).toEqual(createPager());
  });
});

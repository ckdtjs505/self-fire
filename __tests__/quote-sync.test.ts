jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("@/data/quotes.json", () => [
  { id: "1", text: "a", author: "x" },
  { id: "2", text: "b", author: "y" },
]);

import { appStorage, mmkv } from "@/utils/storage";
import { loadSyncedQuotes, syncNewQuotes } from "@/data/quotes";

const mockFetch = (data: unknown[], { ok = true, status = 200 } = {}) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok, status, json: () => Promise.resolve({ status: "success", data }) })
  ) as unknown as typeof fetch;
};

describe("syncNewQuotes", () => {
  beforeEach(async () => {
    mmkv.clearAll();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("번들 이후의 새 명언만 저장하고 반환한다", async () => {
    mockFetch([{ id: 3, text: " 시작이 반이다. ", author: "z" }]);
    const fresh = await syncNewQuotes();
    expect(fresh).toEqual([{ id: "3", text: "시작이 반이다.", author: "z" }]);
    expect(await loadSyncedQuotes()).toEqual(fresh);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("since_id=2"),
      expect.objectContaining({ signal: expect.anything() })
    );
  });

  it("24시간 안에는 다시 요청하지 않는다", async () => {
    mockFetch([{ id: 3, text: "시작이 반이다.", author: "z" }]);
    await syncNewQuotes();
    mockFetch([{ id: 4, text: "아는 것이 힘이다.", author: "z" }]);
    expect(await syncNewQuotes()).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("서버가 이전 id를 섞어 보내면 결과를 버린다", async () => {
    mockFetch([{ id: 1, text: "a", author: "x" }, { id: 3, text: "시작이 반이다.", author: "z" }]);
    expect(await syncNewQuotes()).toEqual([]);
  });

  it("새 명언도 다듬고 부적절한 항목은 뺀다", async () => {
    mockFetch([
      { id: 3, text: "시작이 반이다.\n시작은 절반이다.", author: "" },
      { id: 4, text: "국력은 방어에 있는 것이 아니라 침략에 있다.", author: "아돌프 히틀러" },
    ]);
    expect(await syncNewQuotes()).toEqual([{ id: "3", text: "시작이 반이다.", author: "작자 미상" }]);
  });

  it("HTTP 오류 응답이면 아무것도 저장하지 않는다", async () => {
    mockFetch([{ id: 3, text: "시작이 반이다.", author: "z" }], { ok: false, status: 500 });
    expect(await syncNewQuotes()).toEqual([]);
    expect(await loadSyncedQuotes()).toEqual([]);
  });

  it("응답 형식이 틀리면 아무것도 저장하지 않는다", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ status: "error" }) })
    ) as unknown as typeof fetch;
    expect(await syncNewQuotes()).toEqual([]);
    expect(await loadSyncedQuotes()).toEqual([]);
  });
});

describe("loadSyncedQuotes", () => {
  beforeEach(() => mmkv.clearAll());

  it("저장된 값에서 형식이 맞는 명언만 돌려준다", async () => {
    await appStorage.setItem(
      "synced_quotes",
      JSON.stringify([{ id: "3", text: "시작이 반이다.", author: "z" }, { id: 4 }, "broken"])
    );
    expect(await loadSyncedQuotes()).toEqual([{ id: "3", text: "시작이 반이다.", author: "z" }]);
  });

  it("저장된 값이 목록이 아니면 빈 목록", async () => {
    await appStorage.setItem("synced_quotes", JSON.stringify({ id: "3" }));
    expect(await loadSyncedQuotes()).toEqual([]);
  });
});

describe("loadSyncedQuotes", () => {
  beforeEach(() => mmkv.clearAll());

  it("번들이 덮는 id 범위의 예전 동기화 명언은 버린다 (수정·삭제 반영)", async () => {
    await appStorage.setItem(
      "synced_quotes",
      JSON.stringify([
        { id: "2", text: "삭제된 명언", author: "x" },
        { id: "3", text: "c", author: "z" },
      ])
    );
    expect((await loadSyncedQuotes()).map((q) => q.id)).toEqual(["3"]);
  });
});

describe("syncNewQuotes — featured·categories", () => {
  beforeEach(() => mmkv.clearAll());

  it("값이 있을 때만 남긴다", async () => {
    mockFetch([
      { id: 3, text: "시작이 반이다.", author: "z", featured: 1, categories: "life, effort" },
      { id: 4, text: "아는 것이 힘이다.", author: "z", featured: false, categories: null },
    ]);
    expect(await syncNewQuotes()).toEqual([
      { id: "3", text: "시작이 반이다.", author: "z", featured: true, categories: ["life", "effort"] },
      { id: "4", text: "아는 것이 힘이다.", author: "z" },
    ]);
  });
});

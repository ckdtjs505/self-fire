jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("@/data/quotes.json", () => [
  { id: "1", text: "a", author: "x" },
  { id: "2", text: "b", author: "y" },
]);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadSyncedQuotes, syncNewQuotes } from "@/data/quotes";

const mockFetch = (data: unknown[]) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ status: "success", data }) })
  ) as unknown as typeof fetch;
};

describe("syncNewQuotes", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("번들 이후의 새 명언만 저장하고 반환한다", async () => {
    mockFetch([{ id: 3, text: " c ", author: "z" }]);
    const fresh = await syncNewQuotes();
    expect(fresh).toEqual([{ id: "3", text: "c", author: "z" }]);
    expect(await loadSyncedQuotes()).toEqual(fresh);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("since_id=2"));
  });

  it("24시간 안에는 다시 요청하지 않는다", async () => {
    mockFetch([{ id: 3, text: "c", author: "z" }]);
    await syncNewQuotes();
    mockFetch([{ id: 4, text: "d", author: "z" }]);
    expect(await syncNewQuotes()).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("서버가 이전 id를 섞어 보내면 결과를 버린다", async () => {
    mockFetch([{ id: 1, text: "a", author: "x" }, { id: 3, text: "c", author: "z" }]);
    expect(await syncNewQuotes()).toEqual([]);
  });
});

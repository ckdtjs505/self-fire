jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { useDeedStore } from "@/store/deed";
import { toDateString } from "@/utils/date";
import { Deed, DEED_HISTORY_LIMIT, DEED_MAX_LENGTH, normalizeDeedText, recentDeeds, upsertDeed } from "@/utils/deed";

const quote = { id: "q-1", text: "천 리 길도 한 걸음부터", author: "속담" };
const deed = (date: string, text = "계단으로 올라갔다"): Deed => ({ date, text, quote });

describe("normalizeDeedText", () => {
  it("줄바꿈과 연속 공백을 한 칸으로 모으고 앞뒤 공백을 지운다", () => {
    expect(normalizeDeedText("  미뤄 둔\n\n전화를   걸었다 ")).toBe("미뤄 둔 전화를 걸었다");
  });

  it("최대 길이로 자른다", () => {
    expect(normalizeDeedText("가".repeat(DEED_MAX_LENGTH + 10))).toHaveLength(DEED_MAX_LENGTH);
  });
});

describe("upsertDeed", () => {
  it("같은 날 다시 쓰면 덮어쓴다", () => {
    const deeds = upsertDeed([deed("2026-10-22", "처음")], deed("2026-10-22", "고침"));
    expect(deeds).toEqual([deed("2026-10-22", "고침")]);
  });

  it("날짜 순서를 지킨다", () => {
    const deeds = upsertDeed([deed("2026-10-20"), deed("2026-10-22")], deed("2026-10-21"));
    expect(deeds.map((d) => d.date)).toEqual(["2026-10-20", "2026-10-21", "2026-10-22"]);
  });

  it("오래된 기록부터 지워 최대 개수를 넘지 않는다", () => {
    const many = Array.from({ length: DEED_HISTORY_LIMIT }, (_, i) =>
      deed(toDateString(new Date(2025, 0, 1 + i)))
    );
    const deeds = upsertDeed(many, deed("2099-01-01"));
    expect(deeds).toHaveLength(DEED_HISTORY_LIMIT);
    expect(deeds[0].date).toBe(many[1].date);
    expect(deeds[deeds.length - 1].date).toBe("2099-01-01");
  });
});

describe("recentDeeds", () => {
  it("최근 것부터 돌려준다", () => {
    const deeds = [deed("2026-10-20"), deed("2026-10-21"), deed("2026-10-22")];
    expect(recentDeeds(deeds, 2).map((d) => d.date)).toEqual(["2026-10-22", "2026-10-21"]);
  });
});

describe("useDeedStore.saveToday", () => {
  beforeEach(() => useDeedStore.setState({ deeds: [] }));

  it("오늘 날짜로 한 줄과 따른 문장을 저장한다", () => {
    const saved = useDeedStore.getState().saveToday({ ...quote, featured: true } as never, " 계단으로\n올라갔다 ");
    expect(saved).toEqual({ date: toDateString(), text: "계단으로 올라갔다", quote });
    expect(useDeedStore.getState().deeds).toEqual([saved]);
  });

  it("비어 있으면 저장하지 않는다", () => {
    expect(useDeedStore.getState().saveToday(quote, "   \n ")).toBeNull();
    expect(useDeedStore.getState().deeds).toEqual([]);
  });
});

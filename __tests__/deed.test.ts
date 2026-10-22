jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { useDeedStore } from "@/store/deed";
import { toDateString } from "@/utils/date";
import { Deed, DEED_HISTORY_LIMIT, DEED_MAX_LENGTH, isDeedDone, normalizeDeedText, recentDeeds, upsertDeed } from "@/utils/deed";

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

  it("오늘 날짜로 할 일과 따른 문장을 저장한다 (아직 완료 전)", () => {
    const saved = useDeedStore.getState().saveToday({ ...quote, featured: true } as never, " 계단으로\n오르기 ");
    expect(saved).toEqual({ date: toDateString(), text: "계단으로 오르기", quote, completed: false });
    expect(useDeedStore.getState().deeds).toEqual([saved]);
  });

  it("비어 있으면 저장하지 않는다", () => {
    expect(useDeedStore.getState().saveToday(quote, "   \n ")).toBeNull();
    expect(useDeedStore.getState().deeds).toEqual([]);
  });

  it("완료한 날은 그날 기록으로 굳어 고치지 않는다", () => {
    useDeedStore.getState().saveToday(quote, "계단으로 오르기");
    useDeedStore.getState().completeToday();
    expect(useDeedStore.getState().saveToday(quote, "엘리베이터 타기")).toBeNull();
    expect(useDeedStore.getState().deeds[0].text).toBe("계단으로 오르기");
  });
});

describe("useDeedStore.completeToday", () => {
  beforeEach(() => useDeedStore.setState({ deeds: [], pick: null }));

  it("오늘 할 일을 완료로 표시하고, 두 번은 하지 않는다", () => {
    useDeedStore.getState().saveToday(quote, "계단으로 오르기");
    expect(isDeedDone(useDeedStore.getState().deeds[0])).toBe(false);
    expect(useDeedStore.getState().completeToday()).toBe(true);
    expect(isDeedDone(useDeedStore.getState().deeds[0])).toBe(true);
    expect(useDeedStore.getState().completeToday()).toBe(false);
  });

  it("오늘 할 일이 없으면 완료할 수 없다", () => {
    expect(useDeedStore.getState().completeToday()).toBe(false);
  });

  it("완료 여부가 없는 예전 기록은 이미 불씨를 지핀 날이라 완료로 본다", () => {
    expect(isDeedDone(deed("2026-10-20"))).toBe(true);
  });
});

describe("useDeedStore.pickToday", () => {
  const other = { id: "q-2", text: "실패는 성공의 어머니다", author: "에디슨" };
  beforeEach(() => useDeedStore.setState({ deeds: [], pick: null }));

  it("오늘의 문장을 정하고, 할 일을 정하기 전까지는 바로 바꿀 수 있다", () => {
    expect(useDeedStore.getState().pickToday(quote)).toBe(true);
    expect(useDeedStore.getState().pickToday(other)).toBe(true);
    expect(useDeedStore.getState().pick).toEqual({ date: toDateString(), quote: other });
  });

  it("할 일을 정한 뒤에는 바로 바꾸지 않는다 (할 일 쓰기 화면에서 새 문장으로 다시 남겨야 바뀐다)", () => {
    useDeedStore.getState().pickToday(quote);
    useDeedStore.getState().saveToday(quote, "계단으로 올라갔다");
    expect(useDeedStore.getState().pickToday(other)).toBe(false);
    expect(useDeedStore.getState().pick?.quote).toEqual(quote);
  });

  it("새 문장으로 할 일을 다시 남기면 오늘 할 일과 오늘 고른 문장이 함께 바뀐다", () => {
    useDeedStore.getState().pickToday(quote);
    useDeedStore.getState().saveToday(quote, "계단으로 올라갔다");
    useDeedStore.getState().saveToday(other, "계단으로 올라가며 실패를 떠올렸다");
    const { deeds, pick } = useDeedStore.getState();
    expect(deeds).toHaveLength(1);
    expect(deeds[0].quote).toEqual(other);
    expect(pick).toEqual({ date: toDateString(), quote: other });
  });
});

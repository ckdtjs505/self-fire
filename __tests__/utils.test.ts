import { toDateString } from "@/utils/date";
import { shuffle } from "@/utils/shuffle";

describe("toDateString", () => {
  it("로컬 날짜를 YYYY-MM-DD로 만든다", () => {
    expect(toDateString(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("shuffle", () => {
  it("원본을 바꾸지 않고 같은 원소를 가진 새 배열을 반환한다", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
    expect(result).not.toBe(original);
    expect([...result].sort()).toEqual(original);
  });
});

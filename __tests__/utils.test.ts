import { toDateString } from "@/utils/date";
import { seededShuffle, shuffle } from "@/utils/shuffle";

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

describe("seededShuffle", () => {
  const ids = Array.from({ length: 30 }, (_, i) => `q${i}`);
  const byId = (id: string) => id;

  it("같은 시드면 항상 같은 순서를 반환한다", () => {
    expect(seededShuffle(ids, "2026-10-15", byId)).toEqual(seededShuffle(ids, "2026-10-15", byId));
  });

  it("시드(날짜)가 바뀌면 순서도 바뀐다", () => {
    expect(seededShuffle(ids, "2026-10-15", byId)).not.toEqual(seededShuffle(ids, "2026-10-16", byId));
  });

  it("원본을 바꾸지 않고 같은 원소를 가진 새 배열을 반환한다", () => {
    const original = [...ids];
    const result = seededShuffle(original, "2026-10-15", byId);
    expect(original).toEqual(ids);
    expect([...result].sort()).toEqual([...ids].sort());
  });

  it("원소를 빼도 나머지 원소끼리의 순서는 유지된다", () => {
    const full = seededShuffle(ids, "2026-10-15", byId);
    const withoutFirst = seededShuffle(ids.filter((id) => id !== full[0]), "2026-10-15", byId);
    expect(withoutFirst).toEqual(full.slice(1));
  });
});

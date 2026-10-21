import { notificationDataSchema, parseQuotes } from "@/data/schemas";

describe("parseQuotes", () => {
  it("형식이 맞는 명언만 남긴다", () => {
    expect(
      parseQuotes([
        { id: "1", text: "a", author: "x" },
        { id: 2, text: "b", author: "y" },
        { id: "3", text: "c" },
        null,
      ])
    ).toEqual([{ id: "1", text: "a", author: "x" }]);
  });

  it("목록이 아니면 빈 목록", () => {
    expect(parseQuotes(undefined)).toEqual([]);
    expect(parseQuotes({ id: "1" })).toEqual([]);
  });
});

describe("notificationDataSchema", () => {
  it("오늘의 명언·불씨 알림 데이터를 받아들인다", () => {
    expect(notificationDataSchema.safeParse({ type: "daily", quoteId: "1", text: "a", author: "x" }).success).toBe(true);
    expect(notificationDataSchema.safeParse({ type: "streak" }).success).toBe(true);
  });

  it("모르는 형식이나 빠진 필드는 거른다", () => {
    expect(notificationDataSchema.safeParse({ type: "daily", quoteId: "1" }).success).toBe(false);
    expect(notificationDataSchema.safeParse({ type: "promo" }).success).toBe(false);
    expect(notificationDataSchema.safeParse(null).success).toBe(false);
  });
});

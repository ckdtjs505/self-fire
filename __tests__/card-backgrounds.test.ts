import { CARD_BACKGROUNDS, CardBackgroundId, getCardBackground } from "@/data/card-backgrounds";

describe("CARD_BACKGROUNDS", () => {
  it("id가 겹치지 않는다", () => {
    const ids = CARD_BACKGROUNDS.map((bg) => bg.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("'없음'만 이미지가 없고, 이미지가 있으면 글씨 색을 정할 tone도 있다", () => {
    for (const bg of CARD_BACKGROUNDS) {
      if (bg.id === "none") {
        expect(bg.source).toBeUndefined();
        expect(bg.tone).toBeUndefined();
      } else {
        expect(bg.source).toBeDefined();
        expect(bg.tone).toMatch(/^(dark|light)$/);
      }
    }
  });
});

describe("getCardBackground", () => {
  it("id로 배경을 찾는다", () => {
    expect(getCardBackground("night").label).toBe("밤하늘");
  });

  it("모르는 id면 '없음'으로 돌아간다", () => {
    expect(getCardBackground("removed" as CardBackgroundId).id).toBe("none");
  });
});

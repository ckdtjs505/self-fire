import { MIN_QUOTE_FONT_SIZE, fitQuoteFontSize, shrinkToFit } from "@/utils/quote-font-size";

// iPhone 14 기준 화면 크기
const W = 390;
const H = 844;

describe("fitQuoteFontSize", () => {
  it("짧은 명언은 사용자가 고른 크기를 그대로 쓴다", () => {
    expect(fitQuoteFontSize(20, 26, W, H)).toBe(26);
    expect(fitQuoteFontSize(42, 26, W, H)).toBe(26);
  });

  it("사용자가 고른 크기보다 커지지 않는다", () => {
    expect(fitQuoteFontSize(1, 30, W, H)).toBe(30);
  });

  it("긴 명언은 본문 영역(화면 높이의 36%)에 들어가도록 줄인다", () => {
    const textWidth = W - 16 * 2 - 40 * 2;
    for (const len of [97, 130, 175]) {
      const fs = fitQuoteFontSize(len, 48, W, H);
      expect(fs).toBeLessThan(48);
      // 글자 하나 ≈ fs 너비로 가정한 예상 높이
      const estimatedHeight = ((len * fs) / textWidth) * fs * 1.6;
      expect(estimatedHeight).toBeLessThanOrEqual(H * 0.36);
    }
  });

  it("작은 화면에서도 최소 크기 아래로 내려가지 않는다", () => {
    expect(fitQuoteFontSize(175, 48, 320, 568)).toBeGreaterThanOrEqual(MIN_QUOTE_FONT_SIZE);
  });
});

describe("shrinkToFit", () => {
  it("넘친 만큼 본문 높이가 줄도록 글자 크기를 줄인다", () => {
    // 본문 400px 중 100px 넘침 → 높이 비율 0.75 → 크기 비율 √0.75
    expect(shrinkToFit(40, 400, 100)).toBe(Math.floor(40 * Math.sqrt(0.75)));
  });

  it("조금만 넘쳐도 최소 1px은 줄인다", () => {
    expect(shrinkToFit(30, 400, 1)).toBe(29);
  });

  it("최소 크기 아래로 내려가지 않는다", () => {
    expect(shrinkToFit(16, 400, 390)).toBe(MIN_QUOTE_FONT_SIZE);
  });
});

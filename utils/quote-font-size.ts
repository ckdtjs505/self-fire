// 긴 명언이 카드 영역을 벗어나지 않도록 글자 크기를 정한다.

export const LINE_HEIGHT_RATIO = 1.6;
export const MIN_QUOTE_FONT_SIZE = 14;

// 카드 바깥 margin(lg = 16)과 카드 안쪽 padding(40)
const CARD_MARGIN = 16;
const CARD_PADDING = 40;
// 명언 본문이 쓸 수 있는 화면 높이 비율 (헤더·광고·버튼 영역 제외)
const TEXT_AREA_HEIGHT_RATIO = 0.4;

// 글자 하나 ≈ fontSize 너비로 보면, 필요한 높이 ≈ (len * fs / W) * fs * 1.6 이므로
// 영역에 들어가는 최대 크기는 sqrt(W * H / (1.6 * len)). 사용자가 고른 크기를 넘지는 않는다.
export const fitQuoteFontSize = (len: number, preferred: number, screenWidth: number, screenHeight: number) => {
  const width = screenWidth - CARD_MARGIN * 2 - CARD_PADDING * 2;
  const height = screenHeight * TEXT_AREA_HEIGHT_RATIO;
  const maxFit = Math.sqrt((width * height) / (LINE_HEIGHT_RATIO * Math.max(len, 1)));
  return Math.max(MIN_QUOTE_FONT_SIZE, Math.min(preferred, Math.floor(maxFit)));
};

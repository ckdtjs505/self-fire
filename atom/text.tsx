import { Theme } from "@/themes";
import { createText } from "@shopify/restyle";
import { ComponentProps } from "react";

const RestyleText = createText<Theme>();

// 기기 글자 크기를 아주 크게 키워도 화면 배치가 깨지지 않도록 확대 배율에 상한을 둔다.
// (명언 카드는 quote-items.tsx에서 영역을 넘으면 다시 줄인다)
export const MAX_FONT_SIZE_MULTIPLIER = 1.5;

const Text = (props: ComponentProps<typeof RestyleText>) => (
  <RestyleText maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} {...props} />
);

export default Text;

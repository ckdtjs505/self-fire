// ─────────────────────────────────────────────────────────────
// fonts.ts
// 구글 폰트를 필요한 것만 그때그때 불러온다.
//   - 앱 시작: 명언 카드의 따옴표 폰트와 사용자가 고른 명언 폰트만 (스플래시가 떠 있는 동안)
//   - 폰트 고르기 시트를 열 때: 미리보기용으로 나머지 명언 폰트
// UI 글자는 기기 기본 폰트를 쓰므로 따로 불러오지 않는다.
// ─────────────────────────────────────────────────────────────

import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Jua_400Regular } from "@expo-google-fonts/jua";
import { NanumMyeongjo_400Regular, NanumMyeongjo_800ExtraBold } from "@expo-google-fonts/nanum-myeongjo";
import { NanumPenScript_400Regular } from "@expo-google-fonts/nanum-pen-script";
import { NotoSansKR_400Regular } from "@expo-google-fonts/noto-sans-kr";
import * as Font from "expo-font";
import { useEffect, useState } from "react";

// 사용자가 고를 수 있는 명언 폰트 (store/font-store.ts의 FontId에서 "system"을 뺀 것)
export const QUOTE_FONTS = {
  NotoSansKR_400Regular,
  NanumMyeongjo_400Regular,
  GowunDodum_400Regular,
  Jua_400Regular,
  NanumPenScript_400Regular,
} as const;

export type QuoteFontId = keyof typeof QUOTE_FONTS;

// 명언 카드의 큰 따옴표에 쓰는 폰트 (components/quote-items.tsx)
export const QUOTE_MARK_FONT = "NanumMyeongjo_800ExtraBold";

const ESSENTIAL_FONTS = { [QUOTE_MARK_FONT]: NanumMyeongjo_800ExtraBold };

export const isQuoteFontId = (id: string): id is QuoteFontId => id in QUOTE_FONTS;

/** 앱 시작 때 필요한 폰트(따옴표 + 고른 명언 폰트)를 불러온다. 실패해도 기본 폰트로 계속한다. */
export const loadStartupFonts = async (quoteFontId?: string) => {
  const fonts: Record<string, Font.FontSource> = { ...ESSENTIAL_FONTS };
  if (quoteFontId && isQuoteFontId(quoteFontId)) fonts[quoteFontId] = QUOTE_FONTS[quoteFontId];
  try {
    await Font.loadAsync(fonts);
  } catch (e) {
    console.warn("Font load failed:", e);
  }
};

/** 명언 폰트 하나를 불러온다. 이미 불러왔으면 바로 끝난다. */
export const loadQuoteFont = async (id: QuoteFontId) => {
  if (Font.isLoaded(id)) return;
  await Font.loadAsync({ [id]: QUOTE_FONTS[id] });
};

/**
 * 폰트 이름을 받아, 불러오기가 끝났으면 그대로, 아직이면 undefined(기기 기본 폰트)를 돌려준다.
 * 아직 불러오지 않은 명언 폰트면 불러오기를 시작한다.
 */
export const useLoadedFont = (fontFamily: string | undefined): string | undefined => {
  const [loaded, setLoaded] = useState(() => !fontFamily || Font.isLoaded(fontFamily));

  useEffect(() => {
    if (!fontFamily || Font.isLoaded(fontFamily)) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    if (!isQuoteFontId(fontFamily)) return;
    let cancelled = false;
    loadQuoteFont(fontFamily)
      .then(() => !cancelled && setLoaded(true))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fontFamily]);

  return loaded ? fontFamily : undefined;
};

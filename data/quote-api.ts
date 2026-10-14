// ─────────────────────────────────────────────────────────────
// quote-api.ts
// 명언 서버 API 호출 모음.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";

const QUOTE_API_URL = "https://ckdtjst505.mycafe24.com/api/quote/get_all.php";

// 한 번에 가져오는 명언 개수
export const QUOTE_BATCH_SIZE = 50;

type QuoteApiItem = {
  id: number | string;
  text: string;
  author: string;
};

type QuoteApiResponse = {
  status: string;
  data?: QuoteApiItem[];
};

/**
 * 서버에서 무작위 명언을 limit개 가져온다.
 * 응답 형식이 올바르지 않으면 에러를 던진다.
 */
export const fetchRandomQuotes = async (limit = QUOTE_BATCH_SIZE): Promise<Quote[]> => {
  const response = await fetch(`${QUOTE_API_URL}?random=true&limit=${limit}`);
  const json: QuoteApiResponse = await response.json();

  if (json?.status !== "success" || !Array.isArray(json.data)) {
    throw new Error("Invalid quote API response");
  }

  return json.data.map((item) => ({
    id: String(item.id),
    text: item.text,
    author: item.author,
  }));
};

// ─────────────────────────────────────────────────────────────
// quote-api.ts
// 명언 서버 API 호출 모음.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";

const QUOTE_API_URL = "https://ckdtjst505.mycafe24.com/api/quote/get_all.php";

// 한 번에 화면 목록에 추가하는 명언 개수
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
 * id가 sinceId보다 큰 명언을 id 순으로 최대 limit개 가져온다.
 * 응답 형식이 올바르지 않으면 에러를 던진다.
 * 서버가 since_id를 지원하지 않으면 이전 id가 섞여 올 수 있으므로 호출부에서 확인한다.
 */
export const fetchQuotesSince = async (sinceId: number, limit: number): Promise<Quote[]> => {
  const response = await fetch(`${QUOTE_API_URL}?since_id=${sinceId}&limit=${limit}`);
  const json: QuoteApiResponse = await response.json();

  if (json?.status !== "success" || !Array.isArray(json.data)) {
    throw new Error("Invalid quote API response");
  }

  return json.data.map((item) => ({
    id: String(item.id),
    text: String(item.text ?? "").trim(),
    author: String(item.author ?? "").trim(),
  }));
};

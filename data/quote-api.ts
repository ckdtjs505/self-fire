// ─────────────────────────────────────────────────────────────
// quote-api.ts
// 명언 서버 API 호출 모음.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";
import { quoteApiResponseSchema } from "./schemas";

const QUOTE_API_URL = "https://ckdtjst505.mycafe24.com/api/quote/get_all.php";

// 한 번에 화면 목록에 추가하는 명언 개수
export const QUOTE_BATCH_SIZE = 50;

// 서버가 응답하지 않을 때 기다리는 최대 시간
export const QUOTE_FETCH_TIMEOUT_MS = 10 * 1000;

/**
 * id가 sinceId보다 큰 명언을 id 순으로 최대 limit개 가져온다.
 * 응답이 실패(HTTP 오류·시간 초과)하거나 형식이 올바르지 않으면 에러를 던진다.
 * 서버가 since_id를 지원하지 않으면 이전 id가 섞여 올 수 있으므로 호출부에서 확인한다.
 */
export const fetchQuotesSince = async (sinceId: number, limit: number): Promise<Quote[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUOTE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`${QUOTE_API_URL}?since_id=${sinceId}&limit=${limit}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Quote API HTTP ${response.status}`);

    const parsed = quoteApiResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid quote API response");

    return parsed.data.data.map((item) => ({
      id: String(item.id),
      text: String(item.text ?? "").trim(),
      author: String(item.author ?? "").trim(),
      // featured·categories는 cleanQuotes에서 정리한다.
      featured: item.featured as Quote["featured"],
      categories: item.categories as Quote["categories"],
    }));
  } finally {
    clearTimeout(timer);
  }
};

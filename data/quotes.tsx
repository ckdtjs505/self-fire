// ─────────────────────────────────────────────────────────────
// quotes.tsx
// 명언 데이터 (로컬 우선)
//   - 전체 명언은 앱에 번들된 quotes.json에서 바로 읽는다 (오프라인/즉시 실행).
//   - 서버에 새로 추가된 명언은 하루 1번 백그라운드로 받아와 로컬 저장소(MMKV)에 덧붙인다.
//
// quotes.json은 저장소에 올리지 않는다. `npm run update-quotes`로 생성한다.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";
import { fetchQuotesSince } from "./quote-api";
import { cleanQuotes } from "./quote-cleaner";
import { parseQuotes } from "./schemas";
import bundledQuotes from "./quotes.json";
import { appStorage } from "@/utils/storage";

// 형식이 어긋난 항목은 빼고 쓴다. (quotes.json은 빌드 때 서버 데이터로 만든다)
export const quotes: Quote[] = parseQuotes(bundledQuotes);

const SYNCED_KEY = "synced_quotes"; // 번들 이후 추가된 명언
const LAST_SYNC_KEY = "quotes_last_sync"; // 마지막 동기화 시각 (ms)
const SYNC_INTERVAL = 24 * 60 * 60 * 1000;
const SYNC_LIMIT = 500;

const maxId = (list: Quote[]) => list.reduce((max, q) => Math.max(max, Number(q.id) || 0), 0);

/**
 * 저장해 둔 추가 명언을 읽는다.
 * 새 빌드의 번들이 덮는 id 범위(번들 최대 id 이하)는 번들이 기준이므로 버린다.
 * (그 사이 서버에서 수정·삭제된 명언이 예전 동기화 데이터로 남지 않도록)
 */
export const loadSyncedQuotes = async (): Promise<Quote[]> => {
  try {
    const str = await appStorage.getItem(SYNCED_KEY);
    const saved = str ? parseQuotes(JSON.parse(str)) : [];
    const bundledMax = maxId(quotes);
    return saved.filter((q) => Number(q.id) > bundledMax);
  } catch {
    return [];
  }
};

/**
 * 서버에서 새 명언(id > 현재 최대 id)만 받아와 저장하고, 새로 추가된 명언을 반환한다.
 * 서버가 since_id를 지원하지 않으면(이전 id가 섞여 오면) 결과를 버린다.
 */
export const syncNewQuotes = async (): Promise<Quote[]> => {
  try {
    const last = Number(await appStorage.getItem(LAST_SYNC_KEY)) || 0;
    if (Date.now() - last < SYNC_INTERVAL) return [];

    const synced = await loadSyncedQuotes();
    const sinceId = Math.max(maxId(quotes), maxId(synced));
    const fetched = await fetchQuotesSince(sinceId, SYNC_LIMIT);

    await appStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    if (fetched.some((q) => Number(q.id) <= sinceId)) return [];

    const fresh = cleanQuotes(fetched, [...quotes, ...synced].map((q) => q.text));
    if (fresh.length === 0) return [];

    await appStorage.setItem(SYNCED_KEY, JSON.stringify([...synced, ...fresh]));
    return fresh;
  } catch (e) {
    console.warn("Quote sync failed:", e);
    return [];
  }
};

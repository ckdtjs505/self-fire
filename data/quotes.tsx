import { Quote } from "@/models";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bundledQuotes from "./quotes.json";

// ─────────────────────────────────────────────────────────────
// 명언 데이터 (로컬 우선)
//   - 전체 명언은 앱에 번들된 quotes.json에서 바로 읽는다 (오프라인/즉시 실행).
//   - 서버에 새로 추가된 명언은 하루 1번 백그라운드로 받아와 AsyncStorage에 덧붙인다.
//
// quotes.json 갱신: get_all.php 전체 응답을 [{id,text,author}] 형태로 저장
// ─────────────────────────────────────────────────────────────

export const quotes: Quote[] = bundledQuotes as Quote[];

const API_URL = "https://ckdtjst505.mycafe24.com/api/quote/get_all.php";
const SYNCED_KEY = "synced_quotes";       // 번들 이후 추가된 명언
const LAST_SYNC_KEY = "quotes_last_sync"; // 마지막 동기화 시각 (ms)
const SYNC_INTERVAL = 24 * 60 * 60 * 1000;
const SYNC_LIMIT = 500;

const maxId = (list: Quote[]) =>
  list.reduce((max, q) => Math.max(max, Number(q.id) || 0), 0);

// 저장해 둔 추가 명언을 읽는다.
export const loadSyncedQuotes = async (): Promise<Quote[]> => {
  try {
    const str = await AsyncStorage.getItem(SYNCED_KEY);
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
};

// 서버에서 새 명언(id > 현재 최대 id)만 받아온다. 새로 추가된 명언만 반환.
// 서버가 since_id를 지원하지 않으면(이전 id가 섞여 오면) 결과를 버린다.
export const syncNewQuotes = async (): Promise<Quote[]> => {
  try {
    const last = Number(await AsyncStorage.getItem(LAST_SYNC_KEY)) || 0;
    if (Date.now() - last < SYNC_INTERVAL) return [];

    const synced = await loadSyncedQuotes();
    const sinceId = Math.max(maxId(quotes), maxId(synced));

    const response = await fetch(`${API_URL}?since_id=${sinceId}&limit=${SYNC_LIMIT}`);
    const json = await response.json();
    if (!json || json.status !== "success" || !Array.isArray(json.data)) return [];

    await AsyncStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    if (json.data.some((item: any) => Number(item.id) <= sinceId)) return [];

    const fresh: Quote[] = json.data
      .map((item: any) => ({
        id: String(item.id),
        text: String(item.text ?? "").trim(),
        author: String(item.author ?? "").trim(),
      }))
      .filter((q: Quote) => q.text);
    if (fresh.length === 0) return [];

    await AsyncStorage.setItem(SYNCED_KEY, JSON.stringify([...synced, ...fresh]));
    return fresh;
  } catch (e) {
    console.warn("Quote sync failed:", e);
    return [];
  }
};

export const getQuote = (id: string): Quote | undefined => {
  return quotes.find((q) => q.id === id);
};

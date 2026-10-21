import { loadSyncedQuotes, quotes as bundledQuotes, syncNewQuotes } from "@/data/quotes";
import { Quote } from "@/models";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

// 예전 버전에서 쓰던 랜덤 50개 캐시 키 (정리용)
const LEGACY_QUOTE_CACHE_KEY = "cached_recent_quotes";

/**
 * 기본 명언: 앱에 번들된 전체 명언 + 동기화로 추가된 명언.
 * 번들 명언으로 바로 시작하고, 이전에 동기화한 명언과 서버의 새 명언을 뒤에 덧붙인다.
 */
export const useDefaultQuotes = (): Quote[] => {
  const [defaultQuotes, setDefaultQuotes] = useState<Quote[]>(bundledQuotes);

  useEffect(() => {
    const appendQuotes = (extra: Quote[]) => {
      if (extra.length === 0) return;
      setDefaultQuotes((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        return [...prev, ...extra.filter((q) => !existingIds.has(q.id))];
      });
    };
    (async () => {
      appendQuotes(await loadSyncedQuotes());
      appendQuotes(await syncNewQuotes());
      AsyncStorage.removeItem(LEGACY_QUOTE_CACHE_KEY);
    })();
  }, []);

  return defaultQuotes;
};

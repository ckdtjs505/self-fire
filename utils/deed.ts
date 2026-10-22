// ─────────────────────────────────────────────────────────────
// deed.ts — 실천 한 줄 규칙
//   - 명언을 읽고 그 문장대로 한 일을 한 줄로 남긴다. 이 한 줄이 그날의 불씨를 지핀다.
//   - 하루에 한 줄. 같은 날 다시 쓰면 고친 것으로 보고 덮어쓴다.
//   - 어느 문장을 따라 살았는지 함께 저장한다. (문장이 나중에 서버에서 바뀌어도 그날 본 그대로)
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";

// 한 줄의 최대 길이. 모닥불 시트에 두 줄 안에 들어가는 정도.
export const DEED_MAX_LENGTH = 60;

// 기기에 남겨 둘 최근 기록 수 (1년 남짓)
export const DEED_HISTORY_LIMIT = 400;

export type Deed = {
  date: string; // "YYYY-MM-DD"
  text: string;
  quote: Pick<Quote, "id" | "text" | "author">;
};

// 입력을 한 줄로 다듬는다. 줄바꿈·연속 공백을 하나로 모으고 길이를 자른다.
export const normalizeDeedText = (text: string) =>
  text.replace(/\s+/g, " ").trim().slice(0, DEED_MAX_LENGTH);

// 그날 한 줄을 저장한다. 이미 있으면 바꾸고, 없으면 날짜 순서대로 끼운다.
export const upsertDeed = (deeds: Deed[], deed: Deed): Deed[] => {
  const rest = deeds.filter((d) => d.date !== deed.date);
  return [...rest, deed].sort((a, b) => a.date.localeCompare(b.date)).slice(-DEED_HISTORY_LIMIT);
};

// 최근 기록부터 count개
export const recentDeeds = (deeds: Deed[], count: number) => [...deeds].reverse().slice(0, count);

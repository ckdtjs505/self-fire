// ─────────────────────────────────────────────────────────────
// deed.ts — 오늘 이 문장대로 할 일 한 가지 규칙
//   - 오늘 따를 문장을 고르고, 그 문장대로 할 일 한 가지를 한 줄로 정한다.
//   - 하루를 지내며 해내면 '완료'를 누르고, 그때 그날의 불씨를 지핀다.
//   - 하루에 한 가지. 완료 전에 다시 쓰면 고친 것으로 보고 덮어쓴다. 완료하면 그날 기록으로 굳는다.
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
  // 해내고 완료를 눌렀는지. 이 값이 없는 예전 기록은 한 줄을 남기며 바로 불씨를 지폈으므로 완료로 본다.
  completed?: boolean;
};

// 해낸(완료한) 할 일인지
export const isDeedDone = (deed: Deed) => deed.completed !== false;

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

export type DeedMonth = { title: string; data: Deed[] };

// 해낸 일 기록 화면(app/history.tsx)용: 해낸 날만 최근 달부터, 달 안에서는 최근 날부터 묶는다.
export const groupDoneDeedsByMonth = (deeds: Deed[]): DeedMonth[] => {
  const months: DeedMonth[] = [];
  for (const deed of [...deeds].filter(isDeedDone).sort((a, b) => b.date.localeCompare(a.date))) {
    const [year, month] = deed.date.split("-").map(Number);
    const title = `${year}년 ${month}월`;
    const last = months[months.length - 1];
    if (last?.title === title) last.data.push(deed);
    else months.push({ title, data: [deed] });
  }
  return months;
};

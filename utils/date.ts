// 기기 로컬 시간대 기준 "YYYY-MM-DD" 문자열
// (toISOString은 UTC 기준이라 한국에서는 오전 9시에 날짜가 바뀜)
export const toLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

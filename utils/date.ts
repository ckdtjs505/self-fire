/**
 * 날짜를 "YYYY-MM-DD" 문자열로 변환한다. (기본값: 오늘)
 */
export const toDateString = (date: Date = new Date()): string =>
  date.toISOString().slice(0, 10);

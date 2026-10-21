export interface Quote {
  id: string;
  text: string;
  author: string;
  // 서버에서 고른 대표 명언 (오늘의 명언·알림·위젯 후보). 나만의 명언·예전 데이터에는 없다.
  featured?: boolean;
  // 서버에서 지정한 카테고리 id. 없으면(null) 본문 키워드로 분류한다. (data/quote-categories.ts)
  categories?: string[] | null;
}

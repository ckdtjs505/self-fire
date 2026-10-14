// ─────────────────────────────────────────────────────────────
// quote-categories.ts
// 명언 카테고리. 명언 데이터에는 카테고리 정보가 없어서 본문 키워드로 분류한다.
//   - '성경'처럼 출처로 나누는 카테고리는 작가 칸으로 분류한다.
//   - 한 명언이 여러 카테고리에 속할 수 있다.
//   - 어느 키워드에도 걸리지 않는 명언은 '전체'에서만 보인다.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";

export type CategoryId =
  | "success"
  | "effort"
  | "courage"
  | "happiness"
  | "love"
  | "relation"
  | "life"
  | "wisdom"
  | "bible";

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  // 본문 키워드
  pattern?: RegExp;
  // 작가(출처) 키워드
  authorPattern?: RegExp;
};

export const CATEGORIES: Category[] = [
  { id: "success", label: "성공·도전", emoji: "🏆", pattern: /성공|승리|목표|성취|도전|실패|야망|기회|꿈(?!틀)/ },
  { id: "effort", label: "노력·끈기", emoji: "💪", pattern: /노력|끈기|인내|근면|부지런|꾸준|습관|게으|나태|포기|참을성|땀/ },
  { id: "courage", label: "용기·희망", emoji: "🔥", pattern: /용기|희망|두려움|두려워|자신감|신념|극복|시련|고난|역경|절망|좌절/ },
  { id: "happiness", label: "행복", emoji: "☀️", pattern: /행복|기쁨|즐거움|웃음|감사|만족/ },
  { id: "love", label: "사랑", emoji: "💗", pattern: /사랑|연애|애정|연인|결혼/ },
  { id: "relation", label: "우정·관계", emoji: "🤝", pattern: /친구|우정|이웃|가족|부모|자식|형제|동료/ },
  { id: "life", label: "인생", emoji: "🌱", pattern: /인생|삶|죽음|세월|청춘|젊음|늙|노년/ },
  { id: "wisdom", label: "지혜·배움", emoji: "📚", pattern: /지혜|지식|배움|배우|공부|독서|학문|진리|교육|현명|서적|(^|[^방대정산자비실])책(을|은|이|의|에|과|만|도)/ },
  {
    id: "bible",
    label: "성경",
    emoji: "📖",
    // "이성경"(사람 이름), "유럽의 잠언", "히브리 격언"은 제외
    authorPattern:
      /(^|[^가-힣])성경|성서|구약|신약|복음|(^|『|성서 ?|성경,? ?|구약 ?)잠언|시편|서편|욥기|전도서|아가서|창세기|레위기|신명기|이사야|로마서|에베소서|갈라디아|데살로니가|디모데|베드로전서|요한1서|사도행전|히브리서|^예수|^솔로몬/,
  },
];

const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]));

export const getCategory = (id: CategoryId) => categoryById.get(id);

/** 명언이 해당 카테고리에 속하는지 */
export const matchesCategory = (quote: Quote, id: CategoryId) => {
  const category = categoryById.get(id);
  if (!category) return false;
  return !!(category.pattern?.test(quote.text) || category.authorPattern?.test(quote.author));
};

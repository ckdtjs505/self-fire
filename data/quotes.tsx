import { Quote } from "@/models";

export const quotes: Quote[] = [
  {
    "id": "1",
    "text": "명언 데이터를 불러오는 중입니다. 잠시만 기다려주세요.",
    "author": "로딩 중"
  },
  {
    "id": "2",
    "text": "조직을 만들어야 할 가장 좋은 이유는 의미를 만들기 위해서이다. 세상을 더 좋은 곳으로 만드는 제품이나 서비스를 만들기 위해서이다.",
    "author": "가이 카와사키"
  },
  {
    "id": "3",
    "text": "네 믿음은 네 생각이 된다. 네 생각은 네 말이 된다. 네 말은 네 행동이 된다. 네 행동은 네 습관이 된다. 네 습관은 네 가치가 된다. 네 가치는 네 운명이 된다.",
    "author": "마하트마 간디"
  }
];

export const getQuote = (id: string): Quote | undefined => {
  return quotes.find((q) => q.id === id);
};

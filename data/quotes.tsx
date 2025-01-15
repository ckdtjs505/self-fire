const quotes: Quote[] = [
  {
    id: "1",
    text: "기회는 준비된 자에게 찾아온다.",
    author: "오프라 윈프리",
    isFavorite: false,
  },
  {
    id: "2",
    text: "행동은 모든 성공의 기본이다.",
    author: "파블로 피카소",
    isFavorite: false,
  },
  {
    id: "3",
    text: "노력은 배신하지 않는다.",
    author: "미야모토 무사시",
    isFavorite: false,
  },
  {
    id: "4",
    text: "어제보다 나은 내가 되자.",
    author: "미상",
    isFavorite: false,
  },
  {
    id: "5",
    text: "인생은 10%의 상황과 90%의 태도로 이루어진다.",
    author: "찰스 스윈돌",
    isFavorite: false,
  },
  {
    id: "6",
    text: "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다.",
    author: "마크 주커버그",
    isFavorite: false,
  },
  {
    id: "7",
    text: "실패는 성공으로 가는 디딤돌이다.",
    author: "미상",
    isFavorite: false,
  },
  {
    id: "8",
    text: "포기하지 마라. 위대한 일은 시간이 걸린다.",
    author: "미상",
    isFavorite: false,
  },
  {
    id: "9",
    text: "지금 하지 않으면, 나중에는 더 힘들어진다.",
    author: "미상",
    isFavorite: false,
  },
  {
    id: "10",
    text: "당신이 꿈꿀 수 있다면, 실현할 수도 있다.",
    author: "월트 디즈니",
    isFavorite: false,
  },
];

export const getQuote = () => {
  //const randomNumber = Math.floor(Math.random() * quotes.length);
  const randomNumber = 5;
  return quotes[randomNumber];
};

// ─────────────────────────────────────────────────────────────
// quote-cleaner.js
// 서버에서 받은 명언을 앱에 넣기 전에 다듬는다.
//   - 본문 정리: HTML 엔티티 복원, 여러 번역/주석이 줄바꿈으로 붙은 경우 첫 문장만,
//     한자 병기 제거, 본문에 섞인 "- 작가" 분리
//   - 작가 이름 표기 통일
//   - 명언으로 보기 어려운 항목 제외 (혐오·성적 표현, 독재자·현대 정치인 발언, 개그 멘트 등)
//   - 같은 문장 중복 제거
//
// scripts/update-quotes.js(Node)와 data/quotes.tsx(앱) 양쪽에서 쓰므로 CommonJS로 둔다.
// ─────────────────────────────────────────────────────────────

const UNKNOWN_AUTHOR = "작자 미상";

/** 표기가 여러 가지인 작가 이름 → 대표 표기 */
const AUTHOR_ALIASES = {
  미상: UNKNOWN_AUTHOR,
  작자미상: UNKNOWN_AUTHOR,
  "작자 미상": UNKNOWN_AUTHOR,
  "라 로시푸코": "라 로슈푸코",
  로셔푸코: "라 로슈푸코",
  키케르: "키케로",
  시세로: "키케로",
  케케로: "키케로",
  프랭클린: "벤자민 프랭클린",
  "벤저민 프랭클린": "벤자민 프랭클린",
  셰익스피어: "윌리엄 셰익스피어",
  니체: "프리드리히 니체",
  처칠: "윈스턴 처칠",
  처어칠: "윈스턴 처칠",
  쉴러: "실러",
  쇼펜하워: "쇼펜하우어",
  쇼팬하워: "쇼펜하우어",
  까뮈: "카뮈",
  체홉: "체호프",
  고르키: "고리키",
  고리끼: "고리키",
  롱펠로: "롱펠로우",
  스마일스: "스마일즈",
  카알라일: "칼라일",
  슈바이쩌: "슈바이처",
  슈바이쳐: "슈바이처",
  시바이처: "슈바이처",
  헨렌켈러: "헬렌 켈러",
  헬렌켈러: "헬렌 켈러",
  헨리포드: "헨리 포드",
  펄벅: "펄 벅",
  푸쉬킨: "푸시킨",
  푸슈킨: "푸시킨",
  퓨슈킨: "푸시킨",
  "T. 풀러": "토마스 풀러",
  풀러: "토마스 풀러",
  루트비히비트겐슈타인: "루트비히 비트겐슈타인",
};

/**
 * 명언 목록에서 빼는 작가.
 * 독재자·전쟁범죄 관련 인물, 갈등을 부르는 현대 한국 정치인, 명언이라기보다 개그/방송 멘트인 경우.
 */
const BLOCKED_AUTHORS = new Set([
  // 독재자·선전가
  "히틀러", "아돌프 히틀러", "스탈린", "이오시프 스탈린", "무솔리니", "베니토 무솔리니",
  "괴벨스", "요제프 괴벨스", "마오쩌둥", "모택동", "김일성", "김정일", "김정은", "레닌",
  "블라디미르 레닌", "커티스 르메이", "카스트로", "피델 카스트로",
  // 현대 한국 정치인
  "이승만", "박정희", "전두환", "노태우", "김영삼", "김대중", "노무현", "이명박", "박근혜",
  "문재인", "윤석열", "이재명", "김종필", "안철수", "유시민", "박형준", "이철희", "심상정",
  "박원순", "전원책", "이준석", "진중권", "김문수", "박희태", "문희상", "이해찬", "한광옥",
  "김진태", "김웅", "조원동", "김상조",
  // 개그·방송 멘트, 근거 없는 출처
  "박명수", "김구라", "유병재", "김보성", "안영미", "빽가", "설운도", "이덕화", "김수미",
  "신동엽", "송가인", "기안84", "쿠타민", "마광수",
]);

/** 본문에 이런 표현이 있으면 뺀다. (혐오·성적 표현, 특정 성별 일반화, 정치 구호) */
const BLOCKED_TEXT_PATTERNS = [
  /페미니|미개인|동성애|병신|빨갱이|종북|좌파|우파/,
  /섹스|성욕|성교|성적 본능|욕정|매춘|창녀|강간|간통|정부\(情婦\)|첩을/,
  /(^|[\s,.'"“‘(])(여자|여성|여인|계집)(는|란|이란|이라는|들은|들이란|의 |에게|가 |이 |를 |만큼)/,
];

/** 위 규칙으로 걸러지지 않지만 명언으로 부적절한 개별 항목 id */
const BLOCKED_IDS = new Set([
  "402", // 에디슨 명언의 오역
  "1532", // 강간 관련
  "1581", // 맥락 없는 조직 운영론
  "1626", // 종교 비하
  "4079", // 종교 비하
  "4712", // 전쟁 학살 옹호
  "7094", // 종교 비하
  "1627", // 인종 비하
  "6424", // 핵무장론
  "7280", // 살인 정당화
]);

const ENTITY_MAP = { quot: '"', apos: "'", amp: "&", lt: "<", gt: ">", nbsp: " " };

const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(quot|apos|amp|lt|gt|nbsp);/g, (_, k) => ENTITY_MAP[k]);

const tidy = (s) =>
  s
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

// "용기(勇氣)" → "용기" (호환용 한자 U+F900~ 포함)
const stripHanja = (s) => s.replace(/\s*\([㐀-䶿一-鿿豈-﫿\s]+\)/g, "");

const AUTHOR_SUFFIX = /\s+[-–—]\s*([^.!?]{1,20})$/;

/**
 * 명언 하나를 다듬는다. 제외 대상이면 null.
 * @param {{ id: string, text: string, author: string }} quote
 * @returns {{ id: string, text: string, author: string } | null}
 */
const cleanQuote = (quote) => {
  const id = String(quote.id);
  if (BLOCKED_IDS.has(id)) return null;

  let author = tidy(stripHanja(decodeEntities(String(quote.author ?? ""))));
  const lines = decodeEntities(String(quote.text ?? ""))
    .split(/\r?\n/)
    .map(tidy)
    .filter(Boolean);
  if (lines.length === 0) return null;

  // 둘째 줄이 "- 작가" 또는 작가 이름뿐이면 작가로 쓴다.
  if (!author && lines[1]) {
    const m = lines[1].match(/^[-–—]?\s*([^.!?]{1,20})$/);
    if (m) author = m[1].trim();
  }

  // 여러 번역·한자 원문·"*" 주석이 이어 붙은 경우 첫 문장만 남긴다.
  let text = stripHanja(lines[0]);

  // "... - 황경신"처럼 본문 끝에 작가가 붙은 경우 (작가가 비었거나 같은 이름일 때만)
  const suffix = text.match(AUTHOR_SUFFIX);
  if (suffix && (!author || suffix[1].trim() === author)) {
    author = suffix[1].trim();
    text = text.slice(0, suffix.index).trim();
  }

  author = AUTHOR_ALIASES[author] ?? (author || UNKNOWN_AUTHOR);

  if (text.length < 5) return null;
  if (BLOCKED_AUTHORS.has(author)) return null;
  if (BLOCKED_TEXT_PATTERNS.some((re) => re.test(text))) return null;

  return { id, text, author };
};

// 띄어쓰기·문장부호만 다른 문장은 같은 명언으로 본다.
const dedupeKey = (text) => text.replace(/[^0-9a-zA-Z가-힣]/g, "");

/**
 * 명언 목록을 다듬고 중복을 없앤다. 같은 문장이면 먼저 나온 것을 남긴다.
 * @param {{ id: string, text: string, author: string }[]} list
 * @param {Iterable<string>} [existingTexts] 이미 가지고 있는 명언 본문 (중복 판정용)
 */
const cleanQuotes = (list, existingTexts = []) => {
  const seen = new Set(Array.from(existingTexts, dedupeKey));
  const result = [];
  for (const raw of list) {
    const q = cleanQuote(raw);
    if (!q) continue;
    const key = dedupeKey(q.text);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(q);
  }
  return result;
};

module.exports = { cleanQuote, cleanQuotes };

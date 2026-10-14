/**
 * Fisher–Yates 셔플. 원본 배열은 변경하지 않고 새 배열을 반환한다.
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// 문자열을 32비트 정수로 해시한다. (FNV-1a + murmur3 fmix32로 비트를 고르게 섞음)
const hashString = (text: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};

/**
 * 시드에 따라 항상 같은 순서로 섞는다. 원본 배열은 변경하지 않는다.
 * 각 원소의 순위를 hash(시드 + 키)로 정하므로, 원소가 추가·제거되어도 나머지 원소끼리의 순서는 그대로다.
 */
export const seededShuffle = <T>(array: T[], seed: string, getKey: (item: T) => string): T[] =>
  array
    .map((item) => {
      const key = getKey(item);
      return { item, key, rank: hashString(`${seed}:${key}`) };
    })
    .sort((a, b) => a.rank - b.rank || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ item }) => item);

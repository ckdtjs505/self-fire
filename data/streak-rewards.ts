// ─────────────────────────────────────────────────────────────
// streak-rewards.ts
// 스트릭 마일스톤 보상. 테마·카드 배경 목록의 unlockAt에서 모아 온다.
// ─────────────────────────────────────────────────────────────

import { CARD_BACKGROUNDS } from "@/data/card-backgrounds";
import { themeList } from "@/themes";

// 그 마일스톤에서 열리는 보상 이름. 예) "'잉걸불' 테마"
export const getMilestoneRewardNames = (milestone: number) =>
  [
    ...themeList.filter((t) => t.unlockAt === milestone).map((t) => `'${t.name}' 테마`),
    ...CARD_BACKGROUNDS.filter((bg) => bg.unlockAt === milestone).map((bg) => `'${bg.label}' 카드 배경`),
  ].join(", ");

// 잠긴 보상을 눌렀을 때 안내 문구
export const lockedRewardMessage = (unlockAt: number) => `🔒 ${unlockAt}일 연속 불씨를 지피면 열려요`;

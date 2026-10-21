// ─────────────────────────────────────────────────────────────
// schemas.ts
// 앱 밖에서 들어오는 데이터(서버 응답·번들 JSON·저장소·알림)를 검사하는 zod 스키마.
// 형식이 어긋난 항목은 앱 안으로 들이지 않는다.
// ─────────────────────────────────────────────────────────────

import { Quote } from "@/models";
import { z } from "zod";

export const quoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
});

// 명언 서버 응답. id는 숫자·문자열 모두 오고, text·author는 비어 있을 수 있다.
export const quoteApiResponseSchema = z.object({
  status: z.literal("success"),
  data: z.array(
    z.object({
      id: z.union([z.number(), z.string()]),
      text: z.unknown().optional(),
      author: z.unknown().optional(),
    })
  ),
});

// 알림에 담아 두는 데이터 (services/notifications.ts의 NotificationData와 같은 모양)
export const notificationDataSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("daily"), quoteId: z.string(), text: z.string(), author: z.string() }),
  z.object({ type: z.literal("streak") }),
]);

/** 명언 목록에서 형식이 올바른 항목만 남긴다. (목록이 아니면 빈 목록) */
export const parseQuotes = (value: unknown): Quote[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const result = quoteSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
};

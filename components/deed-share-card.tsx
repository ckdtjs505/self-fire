// ─────────────────────────────────────────────────────────────
// deed-share-card.tsx — 오늘 할 일 공유 이미지
// 오늘 할 일 카드(deed-prompt.tsx)에서 공유를 누르면 이 카드를 PNG로 캡처해 보내거나 갤러리에 저장한다.
// 화면에는 보이지 않도록 화면 밖에 그려 둔다. (완료·고치기 버튼 없이 할 일과 따른 문장만 담는다)
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { useAppTheme } from "@/themes";
import { Deed, isDeedDone } from "@/utils/deed";
import { forwardRef } from "react";
import { View } from "react-native";
import ViewShot from "react-native-view-shot";
import { Ionicon } from "./icon";

// 캡처 이미지 폭. 기기마다 같은 모양으로 나오도록 고정한다.
const CARD_WIDTH = 360;

// 공유 텍스트: 할 일 + 따른 문장
export const deedShareText = (deed: Deed) =>
  `${isDeedDone(deed) ? "오늘 이 문장대로 해낸 일" : "오늘 이 문장대로 할 일"}: ${deed.text}\n“${deed.quote.text}” -${deed.quote.author}`;

const DeedShareCard = forwardRef<ViewShot, { deed: Deed }>(function DeedShareCard({ deed }, ref) {
  const { colors } = useAppTheme();
  const done = isDeedDone(deed);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", left: -10000, top: 0, width: CARD_WIDTH }}
    >
      <ViewShot
        ref={ref}
        options={{ format: "png", quality: 1.0 }}
        style={{
          width: CARD_WIDTH,
          backgroundColor: colors.$surface,
          borderColor: colors.$flame,
          borderWidth: 1.5,
          borderRadius: 28,
          paddingHorizontal: 28,
          paddingTop: 26,
          paddingBottom: 22,
          gap: 14,
        }}
      >
        <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
          <Ionicon name={done ? "checkmark-circle" : "flame"} size={17} color="$flame" />
          <Text fontSize={13} fontWeight="800" color="$muted">
            {done ? "오늘 이 문장대로 해낸 일" : "오늘 이 문장대로 할 일"}
          </Text>
        </Box>

        <Text fontSize={22} lineHeight={31} fontWeight="800">
          {deed.text}
        </Text>

        <Box height={1} bg="$border" style={{ marginVertical: 4 }} />

        <Box style={{ gap: 6 }}>
          <Text fontSize={15} lineHeight={22} fontWeight="600" color="$muted">
            {`“${deed.quote.text}”`}
          </Text>
          <Text variant="caption" fontSize={13}>
            {deed.quote.author}
          </Text>
        </Box>

        {/* 명언 카드와 같은 워터마크 (quote-items.tsx) */}
        <Box flexDirection="row" alignItems="center" alignSelf="center" style={{ marginTop: 6, gap: 4, opacity: 0.65 }}>
          <Ionicon name="flame" size={13} color="$muted" />
          <Text fontSize={12} fontWeight="800" color="$muted" style={{ letterSpacing: 1 }}>
            셀프파이어
          </Text>
        </Box>
      </ViewShot>
    </View>
  );
});

export default DeedShareCard;

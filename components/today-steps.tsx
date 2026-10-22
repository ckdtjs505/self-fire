// ─────────────────────────────────────────────────────────────
// today-steps.tsx — 오늘의 단계
// 홈 헤더 아래에서 하루 흐름 중 어디쯤인지 보여 주는 작은 진행 표시.
//   문장 고르기 → 할 일 정하기 → 해내고 완료 → 불씨
// 할 일을 정하는 것만으로는 불씨가 켜지지 않는다는 것을, 처음 쓰는 사람도 매일 보며 알 수 있게 한다.
//   - 지난 단계: 불씨 색 원 + 체크
//   - 지금 단계: 불씨 색 테두리 + 굵은 글자
//   - 남은 단계: 흐린 테두리
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import FeatherIcon, { Ionicon } from "./icon";

type Props = {
  picked: boolean; // 오늘 따를 문장을 골랐다
  planned: boolean; // 할 일을 정했다
  completed: boolean; // 해내고 완료를 눌렀다
  ignited: boolean; // 불씨를 켰다 (꾹 누르기까지 마쳤다)
};

const STEPS = ["문장 고르기", "할 일 정하기", "해내고 완료", "불씨"] as const;
const CIRCLE = 22;

const TodaySteps: React.FC<Props> = ({ picked, planned, completed, ignited }) => {
  const done = [picked, planned, completed, ignited];
  // 지금 할 단계 (모두 마쳤으면 -1)
  const current = done.indexOf(false);
  const summary =
    current === -1
      ? "오늘의 단계를 모두 마치고 불씨를 켰어요"
      : `오늘의 단계 ${STEPS.length}단계 중 ${current + 1}단계, ${STEPS[current]}`;

  return (
    <Box
      width="100%"
      flexDirection="row"
      alignItems="flex-start"
      px="lg"
      pt="s"
      accessible
      accessibilityLabel={summary}
    >
      {STEPS.map((label, i) => {
        const isDone = done[i];
        const isCurrent = i === current;
        const isLast = i === STEPS.length - 1;
        return (
          <Box key={label} flexDirection="row" alignItems="flex-start" style={{ flex: isLast ? 0 : 1 }}>
            <Box alignItems="center" style={{ width: 64, gap: 4 }}>
              <Box
                width={CIRCLE}
                height={CIRCLE}
                borderRadius="pill"
                justifyContent="center"
                alignItems="center"
                bg={isDone ? "$flame" : "$background"}
                borderWidth={isDone ? 0 : isCurrent ? 2 : 1.5}
                borderColor={isCurrent ? "$flame" : "$border"}
              >
                {isLast ? (
                  <Ionicon
                    name={isDone ? "flame" : "flame-outline"}
                    size={13}
                    color={isDone ? "$onPrimary" : isCurrent ? "$foreground" : "$muted"}
                  />
                ) : isDone ? (
                  <FeatherIcon name="check" size={13} color="$onPrimary" />
                ) : (
                  <Text fontSize={11} fontWeight="800" color={isCurrent ? "$foreground" : "$muted"}>
                    {i + 1}
                  </Text>
                )}
              </Box>
              <Text
                fontSize={11}
                fontWeight={isCurrent ? "800" : "500"}
                color={isCurrent ? "$foreground" : "$muted"}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Box>
            {/* 다음 단계로 잇는 선. 이 단계를 마쳤으면 불씨 색 */}
            {!isLast && (
              <Box
                flex={1}
                height={2}
                borderRadius="pill"
                bg={isDone ? "$flame" : "$border"}
                style={{ marginTop: CIRCLE / 2 - 1, marginHorizontal: -18 }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TodaySteps;

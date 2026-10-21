// ─────────────────────────────────────────────────────────────
// ignite-result-sheet.tsx — 점화 완료
// 불씨를 점화(Hold to Ignite)한 직후 한 번 띄우는 바텀시트.
//   - 오늘까지 쌓인 모닥불과 연속 일수, 다음 단계까지 남은 일수
//   - 마일스톤에 처음 닿았으면 새로 열린 보상
//   - 알림이 꺼져 있으면 (처음 한 번만) 매일 알림 받기를 제안한다
//   - 불씨를 3일·7일 이어 간 날에는 홈 화면 위젯 추가를 제안한다 (Android, 위젯을 아직 놓지 않았을 때)
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { getMilestoneRewardNames } from "@/data/streak-rewards";
import { IgniteResult } from "@/hooks/useDailyIgnite";
import { useNotificationStore } from "@/store/notification";
import { useWidgetPromptStore } from "@/store/widget-prompt";
import { trackEvent } from "@/utils/analytics";
import { CAMPFIRE_STAGES, getCampfireStage } from "@/utils/streak";
import { countInstalledWidgets, isWidgetSupported, shouldPromptWidget } from "@/widgets/widget-pin";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";
import Campfire from "./campfire";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import WidgetOptions from "./widget-options";

export type IgniteResultSheetHandle = {
  open: (result: IgniteResult) => void;
};

// 알림 시간 빠른 선택 (정각)
const REMINDER_HOURS = [7, 8, 12, 21];

const hourLabel = (hour: number) => {
  if (hour < 12) return `아침 ${hour}시`;
  if (hour === 12) return "낮 12시";
  if (hour < 18) return `오후 ${hour - 12}시`;
  return `밤 ${hour - 12}시`;
};

const PrimaryButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
    <Box height={52} borderRadius="pill" bg="$primary" justifyContent="center" alignItems="center">
      <Text color="$onPrimary" fontSize={16} fontWeight="800">
        {label}
      </Text>
    </Box>
  </Pressable>
);

const IgniteResultSheet = forwardRef<IgniteResultSheetHandle>(function IgniteResultSheet(_props, ref) {
  const sheetRef = useRef<PickerSheetHandle>(null);
  const [result, setResult] = useState<IgniteResult>({ streak: 0, unlockedMilestone: null });
  const [offerReminder, setOfferReminder] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [offerWidget, setOfferWidget] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (next) => {
      const notification = useNotificationStore.getState();
      // 알림이 꺼져 있고 아직 제안한 적이 없을 때만 한 번 제안한다. (닫아도 다시 묻지 않음)
      const shouldOffer = !notification.isEnabled && !notification.hasOfferedReminder;
      if (shouldOffer) notification.markReminderOffered();
      setOfferReminder(shouldOffer);
      setReminderHour(notification.notificationHour);

      // 알림 제안과 겹치지 않을 때만 위젯 추가를 제안한다.
      // 이미 놓은 위젯이 없다는 것을 확인한 뒤에 보여 준다. (제안이 잠깐 보였다 사라지지 않도록)
      const widgetPrompt = useWidgetPromptStore.getState();
      const shouldOfferWidget =
        !shouldOffer &&
        shouldPromptWidget({ supported: isWidgetSupported, streak: next.streak, promptedStreaks: widgetPrompt.promptedStreaks });
      setOfferWidget(false);
      if (shouldOfferWidget) {
        widgetPrompt.markPrompted(next.streak);
        countInstalledWidgets().then((count) => {
          if (count > 0) return;
          setOfferWidget(true);
          trackEvent("widget_prompt_shown", { streak: next.streak });
        });
      }

      setResult(next);
      sheetRef.current?.open();
    },
  }));

  const close = () => sheetRef.current?.close();

  // 시트는 바로 닫고, 권한 요청·30일치 예약은 뒤에서 마친 뒤 결과를 토스트로 알려 준다.
  const acceptReminder = async () => {
    close();
    const { setTime, setEnabled } = useNotificationStore.getState();
    await setTime(reminderHour, 0);
    const granted = await setEnabled(true);
    trackEvent("reminder_offer", { accepted: true, granted, hour: reminderHour });
    Toast.show({
      type: granted ? "success" : "info",
      text2: granted
        ? `매일 ${hourLabel(reminderHour)}에 오늘의 명언을 보내 드릴게요`
        : "알림 권한이 꺼져 있어요. 설정에서 언제든 켤 수 있어요",
    });
  };

  const declineReminder = () => {
    trackEvent("reminder_offer", { accepted: false, granted: false, hour: reminderHour });
    close();
  };

  const { streak, unlockedMilestone } = result;
  const nextStage = CAMPFIRE_STAGES.find((s) => s.minDays > streak);
  const title = streak <= 1 ? "첫 불씨가 켜졌어요" : `${streak}일째 불씨가 켜졌어요`;
  const description = nextStage
    ? `${nextStage.minDays - streak}일 더 이어 가면 모닥불이 '${nextStage.name}'로 커져요`
    : `'${getCampfireStage(streak).name}'이 타오르고 있어요`;

  return (
    <PickerSheet ref={sheetRef} title={title} description={description}>
      <Campfire streak={streak} />

      {!!unlockedMilestone && (
        <Box mt="lg" p="lg" borderRadius="md" bg="$primarySoft" gap="xs">
          <Text fontSize={15} fontWeight="800">
            🎁 {unlockedMilestone}일 연속 달성!
          </Text>
          <Text variant="caption">
            새 보상: {getMilestoneRewardNames(unlockedMilestone)} — 테마 메뉴에서 바로 써 보세요
          </Text>
        </Box>
      )}

      {offerReminder ? (
        <Box mt="xl" gap="md">
          <Box gap="xs">
            <Text fontSize={16} fontWeight="800">
              내일도 잊지 않게 알려 드릴까요?
            </Text>
            <Text variant="caption">매일 정한 시간에 오늘의 명언을 보내 드려요</Text>
          </Box>

          <Box flexDirection="row" flexWrap="wrap" gap="s">
            {REMINDER_HOURS.map((hour) => {
              const selected = hour === reminderHour;
              return (
                <Pressable
                  key={hour}
                  onPress={() => setReminderHour(hour)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <Box
                    height={38}
                    px="lg"
                    borderRadius="pill"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor={selected ? "$primary" : "$border"}
                    bg={selected ? "$primarySoft" : "$surfaceMuted"}
                  >
                    <Text fontSize={14} fontWeight={selected ? "800" : "500"} color={selected ? "$primary" : "$foreground"}>
                      {hourLabel(hour)}
                    </Text>
                  </Box>
                </Pressable>
              );
            })}
          </Box>

          <PrimaryButton label={`${hourLabel(reminderHour)}에 알림 받기`} onPress={acceptReminder} />
          <Pressable onPress={declineReminder} hitSlop={8} accessibilityRole="button">
            <Text variant="caption" textAlign="center" fontSize={14}>
              괜찮아요
            </Text>
          </Pressable>
        </Box>
      ) : offerWidget ? (
        <Box mt="xl" gap="md">
          <Box gap="xs">
            <Text fontSize={16} fontWeight="800">
              홈 화면에서 불씨를 지켜보세요
            </Text>
            <Text variant="caption">앱을 열지 않아도 오늘의 명언과 이어 온 날이 보여요</Text>
          </Box>

          <WidgetOptions source="ignite_sheet" onPicked={close} />

          <Pressable
            onPress={() => {
              trackEvent("widget_prompt_dismiss", { streak });
              close();
            }}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text variant="caption" textAlign="center" fontSize={14}>
              괜찮아요
            </Text>
          </Pressable>
        </Box>
      ) : (
        <Box mt="xl">
          <PrimaryButton label="확인" onPress={close} />
        </Box>
      )}
    </PickerSheet>
  );
});

export default IgniteResultSheet;

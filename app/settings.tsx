// ─────────────────────────────────────────────────────────────
// app/settings.tsx
// 앱 설정 화면.
//   - 알림: 오늘의 명언 알림 ON/OFF, 하루 알림 시각(최대 3번, 시스템 시간 선택기), 불씨가 꺼지기 전 저녁 알림 ON/OFF
//   - 서비스: 관심 주제, 나만의 명언 관리, 홈 화면 위젯 추가·꾸미기(Android), 잠금 해제 시 자동 실행(Android),
//             자주 묻는 질문, 응원의 리뷰
//             (광고 제거 인앱 결제는 사업자 등록 전까지 미제공)
//   - 앱 정보: 개인정보 처리방침, 서비스 이용약관, 버전 정보
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import ScreenHeader from "@/components/screen-header";
import SettingItem, { SettingDivider, SettingSection, SettingSwitch } from "@/components/setting-item";
import FeatherIcon from "@/components/icon";
import InterestsSheet from "@/components/interests-sheet";
import TimePickerButton from "@/components/time-picker-button";
import WidgetSheet from "@/components/widget-sheet";
import WidgetStyleSheet from "@/components/widget-style-sheet";
import { PickerSheetHandle } from "@/components/picker-sheet";
import { CATEGORIES } from "@/data/quote-categories";
import { useAutoLaunch } from "@/hooks/useAutoLaunch";
import { useCategoryStore } from "@/store/category";
import { MAX_NOTIFICATION_TIMES, STREAK_REMINDER_HOUR, STREAK_REMINDER_MINUTE } from "@/services/notifications";
import { useNotificationStore } from "@/store/notification";
import { isWidgetSupported } from "@/widgets/widget-pin";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Linking, Pressable, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useShallow } from "zustand/react/shallow";

const FAQ_URL = "https://workshop-code.tistory.com/107";
const PACKAGE_NAME = Application.applicationId || "com.changsunoh.selfFire";
const STORE_REVIEW_URL = `market://details?id=${PACKAGE_NAME}`;
const STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`;

const APP_VERSION = Application.nativeApplicationVersion || "1.0.0";

const pad2 = (value: number) => String(value).padStart(2, "0");

// Play 스토어 앱으로 리뷰 페이지를 열고, 실패하면 웹 페이지로 연다.
const openStoreReview = () => Linking.openURL(STORE_REVIEW_URL).catch(() => Linking.openURL(STORE_WEB_URL));

function SettingContent() {
  const router = useRouter();
  const autoLaunch = useAutoLaunch();
  const {
    isEnabled: isNotificationEnabled,
    notificationTimes,
    setEnabled: setNotificationEnabled,
    setTimeAt,
    addTime,
    removeTime,
    streakReminderEnabled,
    setStreakReminderEnabled,
  } = useNotificationStore(
    useShallow((s) => ({
      isEnabled: s.isEnabled,
      notificationTimes: s.notificationTimes,
      setEnabled: s.setEnabled,
      setTimeAt: s.setTimeAt,
      addTime: s.addTime,
      removeTime: s.removeTime,
      streakReminderEnabled: s.streakReminderEnabled,
      setStreakReminderEnabled: s.setStreakReminderEnabled,
    }))
  );
  const interestIds = useCategoryStore((s) => s.interestIds);
  const interestsSheetRef = useRef<PickerSheetHandle>(null);
  const widgetSheetRef = useRef<PickerSheetHandle>(null);
  const widgetStyleSheetRef = useRef<PickerSheetHandle>(null);
  const interestsSummary =
    interestIds.length === 0
      ? "모든 주제"
      : CATEGORIES.filter((c) => interestIds.includes(c.id))
          .map((c) => c.label)
          .join(", ");

  return (
    <SafeAreaView flex={1} bg="$background">
      <Box flex={1}>
        <ScreenHeader title="설정" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>

          <SettingSection title="알림">
            <SettingItem
              icon="bell"
              title="오늘의 명언 알림"
              onPress={() => setNotificationEnabled(!isNotificationEnabled)}
              rightElement={<SettingSwitch value={isNotificationEnabled} onValueChange={setNotificationEnabled} />}
            />

            {/* 알림이 켜져 있을 때만 시간 설정 표시 (하루 최대 MAX_NOTIFICATION_TIMES번) */}
            {isNotificationEnabled && (
              <>
                {notificationTimes.map(({ hour, minute }, index) => (
                  <Box key={`${hour}:${minute}`}>
                    <SettingDivider />
                    <Box flexDirection="row" alignItems="center" minHeight={58} style={{ paddingHorizontal: 14, gap: 12 }}>
                      <Box width={34} height={34} borderRadius="sm" bg="$surfaceMuted" justifyContent="center" alignItems="center">
                        <FeatherIcon name="clock" size={17} />
                      </Box>
                      <Text variant="body" style={{ flex: 1 }}>
                        {notificationTimes.length > 1 ? `알림 ${index + 1}` : "알림 시간"}
                      </Text>
                      <TimePickerButton
                        hour={hour}
                        minute={minute}
                        onChange={(h, m) => setTimeAt(index, h, m)}
                        accessibilityLabel={`알림 ${index + 1} 시간 바꾸기`}
                      />
                      {notificationTimes.length > 1 && (
                        <Pressable
                          onPress={() => removeTime(index)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`알림 ${index + 1} 지우기`}
                          style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.5 : 1 })}
                        >
                          <FeatherIcon name="x" size={18} color="$muted" />
                        </Pressable>
                      )}
                    </Box>
                  </Box>
                ))}
                {notificationTimes.length < MAX_NOTIFICATION_TIMES && (
                  <>
                    <SettingDivider />
                    <SettingItem icon="plus" title="알림 시간 추가" onPress={addTime} />
                  </>
                )}
                <SettingDivider />
                <SettingItem
                  icon="moon"
                  title={`불씨 꺼짐 알림 (밤 ${STREAK_REMINDER_HOUR - 12}:${pad2(STREAK_REMINDER_MINUTE)})`}
                  onPress={() => setStreakReminderEnabled(!streakReminderEnabled)}
                  rightElement={<SettingSwitch value={streakReminderEnabled} onValueChange={setStreakReminderEnabled} />}
                />
              </>
            )}
          </SettingSection>

          <SettingSection title="서비스">
            <SettingItem
              icon="compass"
              title="관심 주제"
              onPress={() => interestsSheetRef.current?.open()}
              rightElement={
                <Text variant="caption" fontSize={13} numberOfLines={1} style={{ maxWidth: 150 }}>
                  {interestsSummary}
                </Text>
              }
            />
            <SettingDivider />
            <SettingItem icon="edit-3" title="나만의 명언 관리" onPress={() => router.push("/my-quotes")} />
            <SettingDivider />
            {isWidgetSupported && (
              <>
                <SettingItem icon="grid" title="홈 화면 위젯 추가" onPress={() => widgetSheetRef.current?.open()} />
                <SettingDivider />
                <SettingItem icon="droplet" title="위젯 꾸미기" onPress={() => widgetStyleSheetRef.current?.open()} />
                <SettingDivider />
              </>
            )}

            {autoLaunch.isSupported && (
              <>
                <SettingItem
                  icon="zap"
                  title="잠금 해제 시 자동 실행"
                  onPress={autoLaunch.toggle}
                  rightElement={<SettingSwitch value={autoLaunch.isEnabled} onValueChange={autoLaunch.toggle} />}
                />
                <SettingDivider />
              </>
            )}

            <SettingItem icon="help-circle" title="자주 묻는 질문" onPress={() => Linking.openURL(FAQ_URL)} />
            <SettingDivider />

            <SettingItem icon="star" title="응원의 리뷰 쓰기" onPress={openStoreReview} />
          </SettingSection>

          <SettingSection title="앱 정보">
            <SettingItem icon="shield" title="개인정보 처리방침" onPress={() => router.push("/privacy")} />
            <SettingDivider />
            <SettingItem icon="file-text" title="서비스 이용약관" onPress={() => router.push("/terms")} />
            <SettingDivider />
            <SettingItem
              icon="info"
              title="버전 정보"
              rightElement={
                <Text variant="caption" fontSize={14}>
                  {APP_VERSION}
                </Text>
              }
            />
          </SettingSection>

          <Box paddingVertical="xl" alignItems="center">
            <Text variant="caption" fontSize={12}>
              © 2026 Self-Fire. All rights reserved.
            </Text>
          </Box>
        </ScrollView>
      </Box>
      <InterestsSheet ref={interestsSheetRef} />
      <WidgetSheet ref={widgetSheetRef} />
      <WidgetStyleSheet ref={widgetStyleSheetRef} />
    </SafeAreaView>
  );
}

// 관심 주제 바텀시트를 띄우기 위해 이 화면에도 제스처 루트와 시트 프로바이더를 둔다.
export default function SettingScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SettingContent />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

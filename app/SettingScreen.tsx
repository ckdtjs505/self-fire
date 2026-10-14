// ─────────────────────────────────────────────────────────────
// SettingScreen.tsx
// 앱 설정 화면.
//   - 알림: 오늘의 명언 알림 ON/OFF, 알림 시간(시/분) 조정
//   - 서비스: 나만의 명언 관리, 잠금 해제 시 자동 실행(Android),
//             자주 묻는 질문, 광고 제거·구매 복원, 응원의 리뷰
//   - 앱 정보: 개인정보 처리방침, 서비스 이용약관, 버전 정보
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import ScreenHeader from "@/components/screen-header";
import SettingItem, { SettingDivider, SettingSection, SettingSwitch } from "@/components/setting-item";
import FeatherIcon from "@/components/icon";
import { useAutoLaunch } from "@/hooks/useAutoLaunch";
import { useRemoveAdsPurchase } from "@/hooks/useRemoveAdsPurchase";
import { useNotificationStore } from "@/store/notification";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView } from "react-native";

const FAQ_URL = "https://workshop-code.tistory.com/107";
const PACKAGE_NAME = Application.applicationId || "com.changsunoh.selfFire";
const STORE_REVIEW_URL = `market://details?id=${PACKAGE_NAME}`;
const STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_NAME}`;
const MINUTE_STEP = 5;

const APP_VERSION = Application.nativeApplicationVersion || "1.0.0";

// value에 step을 더하되 [0, max] 범위를 벗어나면 반대쪽 끝으로 순환한다.
const stepWithWrap = (value: number, step: number, max: number) => {
  const next = value + step;
  if (next > max) return 0;
  if (next < 0) return max;
  return next;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

// Play 스토어 앱으로 리뷰 페이지를 열고, 실패하면 웹 페이지로 연다.
const openStoreReview = () => Linking.openURL(STORE_REVIEW_URL).catch(() => Linking.openURL(STORE_WEB_URL));

// ‹ 값 › 형태의 시간 조절 버튼
const TimeStepper: React.FC<{ value: number; onDecrease: () => void; onIncrease: () => void }> = ({
  value,
  onDecrease,
  onIncrease,
}) => (
  <Box flexDirection="row" alignItems="center" bg="$surfaceMuted" borderRadius="sm" style={{ padding: 2 }}>
    <Pressable onPress={onDecrease} hitSlop={6} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}>
      <FeatherIcon name="chevron-left" size={16} color="$muted" />
    </Pressable>
    <Text fontSize={16} fontWeight="800" style={{ minWidth: 24, textAlign: "center", fontVariant: ["tabular-nums"] }}>
      {pad2(value)}
    </Text>
    <Pressable onPress={onIncrease} hitSlop={6} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.5 : 1 })}>
      <FeatherIcon name="chevron-right" size={16} color="$muted" />
    </Pressable>
  </Box>
);

export default function SettingScreen() {
  const router = useRouter();
  const autoLaunch = useAutoLaunch();
  const { isAdFree, price, purchaseRemoveAds, restorePurchases } = useRemoveAdsPurchase();
  const {
    isEnabled: isNotificationEnabled,
    notificationHour: hour,
    notificationMinute: minute,
    setEnabled: setNotificationEnabled,
    setTime,
  } = useNotificationStore();

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

            {/* 알림이 켜져 있을 때만 시간 설정 표시 (시: 1시간, 분: 5분 단위) */}
            {isNotificationEnabled && (
              <>
                <SettingDivider />
                <Box flexDirection="row" alignItems="center" minHeight={58} style={{ paddingHorizontal: 14, gap: 12 }}>
                  <Box width={34} height={34} borderRadius="sm" bg="$surfaceMuted" justifyContent="center" alignItems="center">
                    <FeatherIcon name="clock" size={17} />
                  </Box>
                  <Text variant="body" style={{ flex: 1 }}>
                    알림 시간
                  </Text>
                  <Box flexDirection="row" alignItems="center" style={{ gap: 4 }}>
                    <TimeStepper
                      value={hour}
                      onDecrease={() => setTime(stepWithWrap(hour, -1, 23), minute)}
                      onIncrease={() => setTime(stepWithWrap(hour, 1, 23), minute)}
                    />
                    <Text fontSize={16} fontWeight="800" color="$muted">:</Text>
                    <TimeStepper
                      value={minute}
                      onDecrease={() => setTime(hour, stepWithWrap(minute, -MINUTE_STEP, 60 - MINUTE_STEP))}
                      onIncrease={() => setTime(hour, stepWithWrap(minute, MINUTE_STEP, 60 - MINUTE_STEP))}
                    />
                  </Box>
                </Box>
              </>
            )}
          </SettingSection>

          <SettingSection title="서비스">
            <SettingItem icon="edit-3" title="나만의 명언 관리" onPress={() => router.push("/MyQuotesScreen")} />
            <SettingDivider />

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

            <SettingItem
              icon="shopping-cart"
              title="광고 제거"
              onPress={purchaseRemoveAds}
              rightElement={
                isAdFree ? (
                  <Box bg="$primarySoft" borderRadius="pill" px="s" style={{ paddingVertical: 3 }}>
                    <Text fontSize={12} color="$primary" fontWeight="800">
                      적용됨
                    </Text>
                  </Box>
                ) : (
                  <Text variant="caption" fontSize={14} fontWeight="600">
                    {price}
                  </Text>
                )
              }
            />
            <SettingDivider />

            {!isAdFree && (
              <>
                <SettingItem icon="refresh-cw" title="구매 복원" onPress={restorePurchases} />
                <SettingDivider />
              </>
            )}

            <SettingItem icon="star" title="응원의 리뷰 쓰기" onPress={openStoreReview} />
          </SettingSection>

          <SettingSection title="앱 정보">
            <SettingItem icon="shield" title="개인정보 처리방침" onPress={() => router.push("/PrivacyScreen")} />
            <SettingDivider />
            <SettingItem icon="file-text" title="서비스 이용약관" onPress={() => router.push("/TermsScreen")} />
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
    </SafeAreaView>
  );
}

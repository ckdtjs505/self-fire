// ─────────────────────────────────────────────────────────────
// SettingScreen.tsx
// 앱 설정 화면.
//   - 알림: 오늘의 명언 알림 ON/OFF, 알림 시간(시/분) 조정
//   - 서비스: 나만의 명언 관리, 잠금 해제 시 자동 실행(Android),
//             자주 묻는 질문, 광고 제거, 응원의 리뷰
//   - 앱 정보: 개인정보 처리방침, 서비스 이용약관, 버전 정보
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import SettingItem, { SettingDivider, SettingSection, SettingSwitch } from "@/components/setting-item";
import { useAutoLaunch } from "@/hooks/useAutoLaunch";
import { useRemoveAdsPurchase } from "@/hooks/useRemoveAdsPurchase";
import { useNotificationStore } from "@/store/notification";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import { Linking, ScrollView } from "react-native";

const FAQ_URL = "https://workshop-code.tistory.com/107";
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

// ‹ 값 › 형태의 시간 조절 버튼
const TimeStepper: React.FC<{ value: number; onDecrease: () => void; onIncrease: () => void }> = ({
  value,
  onDecrease,
  onIncrease,
}) => (
  <Box flexDirection="row" alignItems="center" style={{ gap: 6 }}>
    <Box bg="$background" borderRadius="md" px="s" py="xs" onTouchEnd={onDecrease}>
      <Text fontSize={16}>‹</Text>
    </Box>
    <Text fontSize={15} fontWeight="bold" style={{ minWidth: 24, textAlign: "center" }}>
      {pad2(value)}
    </Text>
    <Box bg="$background" borderRadius="md" px="s" py="xs" onTouchEnd={onIncrease}>
      <Text fontSize={16}>›</Text>
    </Box>
  </Box>
);

export default function SettingScreen() {
  const router = useRouter();
  const autoLaunch = useAutoLaunch();
  const { isAdFree, purchaseRemoveAds } = useRemoveAdsPurchase();
  const {
    isEnabled: isNotificationEnabled,
    notificationHour: hour,
    notificationMinute: minute,
    setEnabled: setNotificationEnabled,
    setTime,
  } = useNotificationStore();

  return (
    <SafeAreaView flex={1}>
      <Box backgroundColor="$background" flex={1}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text fontSize={24} fontWeight="bold" marginBottom="xl" marginTop="s">
            설정
          </Text>

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
                <Box flexDirection="row" alignItems="center" justifyContent="space-between" px="md" minHeight={56}>
                  <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
                    <Text fontSize={14}>⏰</Text>
                    <Text fontSize={14}>알림 시간</Text>
                  </Box>
                  <Box flexDirection="row" alignItems="center" style={{ gap: 4 }}>
                    <TimeStepper
                      value={hour}
                      onDecrease={() => setTime(stepWithWrap(hour, -1, 23), minute)}
                      onIncrease={() => setTime(stepWithWrap(hour, 1, 23), minute)}
                    />
                    <Text fontSize={15} fontWeight="bold">:</Text>
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
                  <Text fontSize={14} color="$primary" fontWeight="bold">
                    활성화됨
                  </Text>
                ) : (
                  <Text fontSize={14} style={{ opacity: 0.6 }}>
                    ₩990
                  </Text>
                )
              }
            />
            <SettingDivider />

            {/* TODO: 스토어 리뷰 페이지 연결 */}
            <SettingItem icon="star" title="응원의 리뷰 쓰기" onPress={() => console.log("click")} />
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
                <Text color="$sidebarForeground" style={{ opacity: 0.6 }}>
                  {APP_VERSION}
                </Text>
              }
            />
          </SettingSection>

          <Box paddingVertical="xl" alignItems="center">
            <Text fontSize={12} color="$foreground" style={{ opacity: 0.4 }}>
              © 2026 Self-Fire. All rights reserved.
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

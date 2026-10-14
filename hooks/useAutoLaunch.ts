// ─────────────────────────────────────────────────────────────
// useAutoLaunch.ts
// (Android 전용) '잠금 해제 시 자동 실행' 설정 상태 관리.
// 이 기능에는 '다른 앱 위에 표시'(오버레이) 권한이 필요하므로,
// 저장된 설정값과 실제 권한 상태를 항상 맞춰 준다.
// ─────────────────────────────────────────────────────────────

import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, NativeModules, Platform, ToastAndroid } from "react-native";

const { AutoLaunchModule } = NativeModules;

const isSupported = Platform.OS === "android" && !!AutoLaunchModule;

export const useAutoLaunch = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  // 토글을 켜려고 권한 설정 화면으로 보냈는지 여부.
  // true이면 앱으로 돌아왔을 때 권한 허용 결과를 확인한다.
  const isAwaitingPermission = useRef(false);

  // 권한 설정 화면에서 돌아왔을 때: 허용했으면 켜고, 아니면 안내한다.
  const applyPermissionResult = useCallback(async () => {
    const hasPermission: boolean = await AutoLaunchModule.hasOverlayPermission();
    if (hasPermission) {
      await AutoLaunchModule.setEnabled(true);
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
      ToastAndroid.show("기능을 쓰려면 '다른 앱 위에 표시' 권한이 필요해요", ToastAndroid.LONG);
    }
  }, []);

  // 화면 진입/복귀 시: 켜져 있는데 권한이 해제됐다면 강제로 끈다.
  const syncWithPermission = useCallback(async () => {
    const hasPermission: boolean = await AutoLaunchModule.hasOverlayPermission();
    const savedEnabled: boolean = await AutoLaunchModule.isEnabled();

    if (savedEnabled && !hasPermission) {
      await AutoLaunchModule.setEnabled(false);
      setIsEnabled(false);
      ToastAndroid.show("'다른 앱 위에 표시' 권한이 해제되어 자동 실행이 꺼졌어요", ToastAndroid.LONG);
    } else {
      setIsEnabled(savedEnabled);
    }
  }, []);

  // 화면이 포커스를 받을 때마다 동기화 (네비게이션 진입 & 시스템 설정 복귀 포함)
  useFocusEffect(
    useCallback(() => {
      if (isSupported) syncWithPermission();
    }, [syncWithPermission])
  );

  // 권한 설정 화면에서 앱으로 돌아온 경우만 처리한다. (일반 복귀는 useFocusEffect가 담당)
  useEffect(() => {
    if (!isSupported) return;

    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "active" && isAwaitingPermission.current) {
        isAwaitingPermission.current = false;
        await applyPermissionResult();
      }
    });
    return () => subscription.remove();
  }, [applyPermissionResult]);

  // 토글: 켜려는데 권한이 없으면 설정 화면으로 보내고, 돌아온 뒤에 결과를 반영한다.
  const toggle = async () => {
    if (!isSupported) return;

    const nextValue = !isEnabled;
    if (nextValue) {
      const hasPermission: boolean = await AutoLaunchModule.hasOverlayPermission();
      if (!hasPermission) {
        isAwaitingPermission.current = true;
        await AutoLaunchModule.openOverlaySettings();
        return;
      }
    }

    try {
      await AutoLaunchModule.setEnabled(nextValue);
      setIsEnabled(nextValue);
    } catch (e) {
      console.error("Failed to toggle auto launch", e);
    }
  };

  return { isSupported, isEnabled, toggle };
};

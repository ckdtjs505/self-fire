// ─────────────────────────────────────────────────────────────
// storage.ts
// 앱의 모든 로컬 저장소. MMKV(네이티브, 동기)를 쓴다.
//   - zustand persist 스토어는 stateStorage, 그 밖의 키는 appStorage로 읽고 쓴다.
//   - MMKV에 값이 있으면 바로(동기로) 돌려주므로 앱을 켤 때 스토어가 기다리지 않고 채워진다.
//   - 예전 버전이 AsyncStorage에 남긴 값은 처음 한 번 MMKV로 옮긴다.
//     옮기기가 끝나기 전에 읽은 키는 그 자리에서 AsyncStorage를 찾아 옮긴다.
// ─────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

export const mmkv = createMMKV({ id: "self-fire" });

// AsyncStorage → MMKV 옮기기를 마쳤다는 표시
const MIGRATED_KEY = "__asyncStorageMigrated";

const isMigrated = () => mmkv.getBoolean(MIGRATED_KEY) === true;
// 옮기는 도중 지운 키. 옮기기가 늦게 끝나도 다시 써 넣지 않는다.
const removedDuringMigration = new Set<string>();

// 키 하나를 AsyncStorage에서 찾아 MMKV로 옮긴다. 그 사이 새로 쓴 값이 있으면 그 값이 이긴다.
const migrateKey = async (key: string): Promise<string | null> => {
  try {
    const legacy = await AsyncStorage.getItem(key);
    const current = mmkv.getString(key);
    if (current !== undefined) return current;
    if (legacy === null || removedDuringMigration.has(key)) return null;
    mmkv.set(key, legacy);
    AsyncStorage.removeItem(key).catch(() => {});
    return legacy;
  } catch {
    return mmkv.getString(key) ?? null;
  }
};

/** 예전 AsyncStorage 값을 한꺼번에 MMKV로 옮긴다. 이미 옮겼으면 아무것도 하지 않는다. */
export const migrateFromAsyncStorage = async () => {
  if (isMigrated()) return;
  try {
    // 웹에서는 둘 다 localStorage를 쓰므로 MMKV가 붙인 접두사(id\\) 키는 건너뛴다.
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => !key.includes("\\"));
    const entries = await AsyncStorage.multiGet(keys);
    for (const [key, value] of entries) {
      if (value !== null && !mmkv.contains(key) && !removedDuringMigration.has(key)) mmkv.set(key, value);
    }
    // 웹의 localStorage에는 다른 라이브러리 키도 있으므로 네이티브에서만 비운다.
    if (Platform.OS !== "web") await AsyncStorage.multiRemove(keys);
    mmkv.set(MIGRATED_KEY, true);
  } catch (e) {
    // 다음 실행 때 다시 시도한다. 그동안은 키마다 따로 옮긴다.
    console.warn("[storage] AsyncStorage 이전 실패", e);
  }
};

const getItem = (key: string): string | null | Promise<string | null> => {
  const value = mmkv.getString(key);
  if (value !== undefined) return value;
  return isMigrated() ? null : migrateKey(key);
};

const setItem = (key: string, value: string) => {
  mmkv.set(key, value);
};

const removeItem = (key: string) => {
  mmkv.remove(key);
  // 옮기기 전이면 예전 값이 다시 살아나지 않게 함께 지운다.
  if (!isMigrated()) {
    removedDuringMigration.add(key);
    AsyncStorage.removeItem(key).catch(() => {});
  }
};

/** zustand persist용 저장소: `storage: createJSONStorage(() => stateStorage)` */
export const stateStorage: StateStorage = { getItem, setItem, removeItem };

/** AsyncStorage와 같은 모양의 키-값 저장소 (기존 호출부를 그대로 쓸 수 있게 Promise로 감쌈) */
export const appStorage = {
  getItem: async (key: string) => getItem(key),
  setItem: async (key: string, value: string) => setItem(key, value),
  removeItem: async (key: string) => removeItem(key),
};

migrateFromAsyncStorage();

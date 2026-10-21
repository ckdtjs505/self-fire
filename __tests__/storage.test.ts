jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import AsyncStorage from "@react-native-async-storage/async-storage";

// 앱을 새로 켠 것처럼 storage 모듈을 다시 불러온다 (MMKV 목도 새로 만들어진다).
const loadStorage = () => {
  let mod!: typeof import("@/utils/storage");
  jest.isolateModules(() => {
    mod = require("@/utils/storage");
  });
  return mod;
};

const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("AsyncStorage → MMKV 이전", () => {
  it("예전 값을 모두 옮기고 AsyncStorage는 비운다", async () => {
    await AsyncStorage.multiSet([
      ["favorites", '{"state":{"favorites":["1"]},"version":0}'],
      ["font_id", "jua"],
    ]);

    const { appStorage, mmkv } = loadStorage();
    await flush();

    expect(mmkv.getString("favorites")).toBe('{"state":{"favorites":["1"]},"version":0}');
    expect(await appStorage.getItem("font_id")).toBe("jua");
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it("옮기기 전에 읽어도 예전 값을 돌려준다", async () => {
    await AsyncStorage.setItem("font_id", "jua");
    const { stateStorage } = loadStorage();
    expect(await stateStorage.getItem("font_id")).toBe("jua");
  });

  it("옮기는 사이 새로 쓴 값을 예전 값으로 덮지 않는다", async () => {
    await AsyncStorage.setItem("font_id", "jua");
    const { appStorage } = loadStorage();
    await appStorage.setItem("font_id", "gowun");
    await flush();
    expect(await appStorage.getItem("font_id")).toBe("gowun");
  });

  it("옮긴 뒤에는 MMKV 값을 동기로 바로 돌려준다", async () => {
    const { stateStorage } = loadStorage();
    await flush();
    stateStorage.setItem("theme-storage", "{}");
    expect(stateStorage.getItem("theme-storage")).toBe("{}");
    expect(stateStorage.getItem("없는-키")).toBeNull();
  });

  it("지운 키는 다시 살아나지 않는다", async () => {
    await AsyncStorage.setItem("has_swiped", "true");
    const { appStorage } = loadStorage();
    await appStorage.removeItem("has_swiped");
    await flush();
    expect(await appStorage.getItem("has_swiped")).toBeNull();
  });
});

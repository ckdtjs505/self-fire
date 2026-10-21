// 모든 테스트 전에 불러오는 공통 목(mock).
// 네이티브 모듈이 없는 Jest 환경에서도 MMKV·Reanimated를 쓰는 코드를 불러올 수 있게 한다.

// MMKV는 Jest에서 메모리 저장소로 바뀌지만, 불러올 때 Nitro 네이티브 모듈을 찾으므로 비워 둔다.
jest.mock("react-native-nitro-modules", () => ({
  NitroModules: { createHybridObject: jest.fn() },
}));

// Reanimated 4가 쓰는 Worklets의 네이티브 부분 대신 JS 목을 쓴다.
jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn(),
  requestReview: jest.fn(),
}));
jest.mock("@/utils/analytics", () => ({ trackEvent: jest.fn() }));

import * as StoreReview from "expo-store-review";
import { maybeRequestReview, REVIEW_REQUESTED_KEY, shouldRequestReview } from "@/services/store-review";
import { appStorage } from "@/utils/storage";

const isAvailable = StoreReview.isAvailableAsync as jest.Mock;
const requestReview = StoreReview.requestReview as jest.Mock;

describe("shouldRequestReview", () => {
  it("불씨를 7일 이상 이어 간 날에 요청한다", () => {
    [7, 8, 30].forEach((streak) => expect(shouldRequestReview({ streak, requested: false })).toBe(true));
  });

  it("7일 전에는 요청하지 않는다", () => {
    [0, 1, 3, 6].forEach((streak) => expect(shouldRequestReview({ streak, requested: false })).toBe(false));
  });

  it("이미 요청했으면 다시 요청하지 않는다", () => {
    expect(shouldRequestReview({ streak: 10, requested: true })).toBe(false);
  });
});

describe("maybeRequestReview", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    isAvailable.mockResolvedValue(true);
    requestReview.mockResolvedValue(undefined);
    await appStorage.removeItem(REVIEW_REQUESTED_KEY);
  });

  it("7일째 한 번만 리뷰 창을 요청한다", async () => {
    expect(await maybeRequestReview(7)).toBe(true);
    expect(await maybeRequestReview(8)).toBe(false);
    expect(requestReview).toHaveBeenCalledTimes(1);
  });

  it("7일 전에는 요청하지 않고 기록도 남기지 않는다", async () => {
    expect(await maybeRequestReview(6)).toBe(false);
    expect(requestReview).not.toHaveBeenCalled();
    expect(await appStorage.getItem(REVIEW_REQUESTED_KEY)).toBeNull();
  });

  it("스토어 리뷰를 쓸 수 없는 기기에서는 요청하지 않는다", async () => {
    isAvailable.mockResolvedValue(false);
    expect(await maybeRequestReview(7)).toBe(false);
    expect(requestReview).not.toHaveBeenCalled();
  });

  it("요청이 실패해도 에러를 던지지 않는다", async () => {
    requestReview.mockRejectedValue(new Error("no play services"));
    await expect(maybeRequestReview(7)).resolves.toBe(false);
  });
});

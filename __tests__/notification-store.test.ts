jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("expo-notifications", () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("id")),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  SchedulableTriggerInputTypes: { DATE: "date" },
}));
jest.mock("@/services/notifications", () => ({
  ...jest.requireActual("@/services/notifications"),
  rescheduleNotifications: jest.fn(() => Promise.resolve()),
}));

import { useNotificationStore } from "@/store/notification";

const times = () => useNotificationStore.getState().notificationTimes;

describe("알림 시각 설정", () => {
  beforeEach(() => useNotificationStore.setState({ notificationTimes: [{ hour: 8, minute: 0 }] }));

  it("알림 시각을 더하면 아직 쓰지 않은 시각을 고르고, 3개까지만 더한다", async () => {
    const { addTime } = useNotificationStore.getState();
    await addTime();
    await addTime();
    await addTime();
    expect(times()).toEqual([
      { hour: 8, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 18, minute: 0 },
    ]);
  });

  it("시각을 바꾸면 다시 정렬하고, 같은 시각이 되면 하나로 합친다", async () => {
    const { setTimes, setTimeAt } = useNotificationStore.getState();
    await setTimes([{ hour: 8, minute: 0 }, { hour: 12, minute: 0 }]);

    await setTimeAt(0, 22, 15);
    expect(times()).toEqual([{ hour: 12, minute: 0 }, { hour: 22, minute: 15 }]);

    await setTimeAt(0, 22, 15);
    expect(times()).toEqual([{ hour: 22, minute: 15 }]);
  });

  it("알림 시각은 하나는 남긴다", async () => {
    await useNotificationStore.getState().removeTime(0);
    expect(times()).toEqual([{ hour: 8, minute: 0 }]);
  });

  it("예전 하루 한 번 설정을 첫 알림 시각으로 넘겨 받는다", () => {
    const { migrate } = useNotificationStore.persist.getOptions();
    const migrated = migrate!({ isEnabled: true, notificationHour: 7, notificationMinute: 30 }, 0) as {
      notificationTimes: unknown;
      isEnabled: boolean;
    };
    expect(migrated.notificationTimes).toEqual([{ hour: 7, minute: 30 }]);
    expect(migrated.isEnabled).toBe(true);
    expect(migrated).not.toHaveProperty("notificationHour");
  });
});

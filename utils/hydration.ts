// zustand persist 스토어가 저장값을 다 불러올 때까지 기다린다.
// (불러오기 전에 계산하면 저장값에 덮이거나 기본값으로 계산된다)

type PersistedStore = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
};

export const waitForHydration = (store: PersistedStore) =>
  new Promise<void>((resolve) => {
    if (store.persist.hasHydrated()) return resolve();
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });

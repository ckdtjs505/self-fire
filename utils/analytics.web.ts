// 웹에서는 Firebase 네이티브 모듈이 없으므로 아무것도 하지 않는다.
import type * as Native from "./analytics";

export const initAnalytics: typeof Native.initAnalytics = () => {};
export const trackEvent: typeof Native.trackEvent = () => {};
export const trackScreen: typeof Native.trackScreen = () => {};
export const setUserProp: typeof Native.setUserProp = () => {};
export const reportError: typeof Native.reportError = () => {};

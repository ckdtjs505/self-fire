jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("@/utils/analytics", () => ({ reportError: jest.fn() }));

import ErrorFallback from "@/components/error-fallback";
import { reportError } from "@/utils/analytics";
import { act, create, ReactTestRenderer } from "react-test-renderer";

describe("ErrorFallback", () => {
  it("에러를 Crashlytics에 기록하고 '다시 시도'를 누르면 retry를 부른다", async () => {
    const error = new Error("boom");
    const retry = jest.fn(() => Promise.resolve());

    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<ErrorFallback error={error} retry={retry} />);
    });

    expect(reportError).toHaveBeenCalledWith(error, "ErrorBoundary");

    await act(async () => {
      tree.root
        .find((node) => node.props.accessibilityLabel === "다시 시도" && typeof node.props.onPress === "function")
        .props.onPress();
    });
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

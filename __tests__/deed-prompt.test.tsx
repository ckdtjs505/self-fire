jest.mock("@/utils/haptics", () => ({ tapHaptic: jest.fn() }));

// 공유 시트는 바텀시트 모듈이 필요하므로, 연 횟수와 받은 공유 내용만 확인한다.
const mockShareOpen = jest.fn();
jest.mock("@/components/share-sheet", () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return forwardRef(function MockShareSheet(props: { text: string; subject?: string }, ref: unknown) {
    useImperativeHandle(ref, () => ({ open: mockShareOpen, close: jest.fn() }));
    return <Text testID="share-sheet">{`${props.subject}|${props.text}`}</Text>;
  });
});
jest.mock("react-native-view-shot", () => {
  const { forwardRef } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return forwardRef(function MockViewShot(props: object, ref: unknown) {
    return <View ref={ref} {...props} />;
  });
});

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import DeedPrompt from "@/components/deed-prompt";
import { Quote } from "@/models";
import { getTheme } from "@/themes";
import { Deed } from "@/utils/deed";
import { ThemeProvider } from "@shopify/restyle";
import { fireEvent, render, screen } from "@testing-library/react-native";

const followed: Quote = { id: "1", text: "포기하지 마라.", author: "윈스턴 처칠" };
const other: Quote = { id: "2", text: "실패는 성공의 어머니다.", author: "토머스 에디슨" };
const task: Deed = { date: "2026-10-22", text: "미뤄 둔 전화 오늘 걸기", quote: followed, completed: false };
const done: Deed = { ...task, completed: true };

const onPick = jest.fn();
const onComplete = jest.fn();
const renderPrompt = (quote: Quote | null, todayDeed: Deed | null, todayQuote: Quote | null) =>
  render(
    <ThemeProvider theme={getTheme("dark")}>
      <DeedPrompt quote={quote} todayDeed={todayDeed} todayQuote={todayQuote} onPick={onPick} onComplete={onComplete} />
    </ThemeProvider>
  );

describe("DeedPrompt", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockShareOpen.mockClear();
    onPick.mockClear();
    onComplete.mockClear();
  });

  it("오늘 따를 문장을 아직 정하지 않았으면 지금 보는 문장으로 정한다", () => {
    renderPrompt(other, null, null);
    fireEvent.press(screen.getByLabelText("오늘 이 문장대로 살기"));
    expect(onPick).toHaveBeenCalledWith(other);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("정한 문장 아래에서는 그 문장으로 할 일을 정하러 간다", () => {
    renderPrompt(followed, null, followed);
    fireEvent.press(screen.getByLabelText("오늘 이 문장대로 할 일 정하기"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/deed",
      params: { quoteId: followed.id, text: followed.text, author: followed.author },
    });
  });

  it("할 일을 정하기 전에는 다른 문장으로 오늘 따를 문장을 바로 바꿀 수 있다", () => {
    renderPrompt(other, null, followed);
    fireEvent.press(screen.getByLabelText("오늘 따를 문장을 이 문장으로 바꾸기"));
    expect(onPick).toHaveBeenCalledWith(other);
  });

  it("할 일을 정했으면 할 일을 자르지 않고 보여 주고, 누르면 고치러 간다", () => {
    renderPrompt(followed, task, followed);
    expect(screen.getByText("오늘 이 문장대로 할 일")).toBeTruthy();
    expect(screen.getByText(task.text)).toBeTruthy();
    fireEvent.press(screen.getByLabelText(`오늘 이 문장대로 할 일: ${task.text}`));
    expect(mockPush).toHaveBeenCalledWith("/deed");
  });

  it("해냈으면 완료를 눌러 알린다", () => {
    renderPrompt(followed, task, followed);
    fireEvent.press(screen.getByLabelText("오늘 할 일 완료"));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("완료한 할 일은 해낸 일로 보여 주고, 고치거나 다시 완료할 수 없다", () => {
    renderPrompt(followed, done, followed);
    expect(screen.getByText("오늘 이 문장대로 해낸 일")).toBeTruthy();
    expect(screen.queryByLabelText("오늘 할 일 완료")).toBeNull();
    expect(screen.queryByLabelText(`오늘 이 문장대로 할 일: ${done.text}`)).toBeNull();
  });

  it("할 일 카드에서 공유를 누르면 할 일과 따른 문장으로 공유 시트를 연다", () => {
    renderPrompt(followed, task, followed);
    fireEvent.press(screen.getByLabelText("오늘 할 일 공유"));
    expect(mockShareOpen).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("share-sheet").props.children).toBe(
      `deed|오늘 이 문장대로 할 일: ${task.text}\n“${followed.text}” -${followed.author}`
    );
  });

  it("해낸 일도 공유할 수 있다", () => {
    renderPrompt(followed, done, followed);
    fireEvent.press(screen.getByLabelText("오늘 할 일 공유"));
    expect(mockShareOpen).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("share-sheet").props.children).toContain(`오늘 이 문장대로 해낸 일: ${done.text}`);
  });

  it("할 일을 정한 뒤 다른 문장에서 바꾸면 바로 바꾸지 않고 그 문장으로 할 일 쓰기 화면을 연다", () => {
    renderPrompt(other, task, followed);
    fireEvent.press(screen.getByLabelText("오늘 따를 문장을 이 문장으로 바꾸기"));
    expect(onPick).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/deed",
      params: { quoteId: other.id, text: other.text, author: other.author },
    });
  });

  it("완료한 날에는 다른 문장에서 바꾸기를 보여 주지 않는다", () => {
    renderPrompt(other, done, followed);
    expect(screen.queryByLabelText("오늘 따를 문장을 이 문장으로 바꾸기")).toBeNull();
  });
});

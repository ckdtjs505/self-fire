jest.mock("@/utils/haptics", () => ({ tapHaptic: jest.fn() }));

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
const deed: Deed = { date: "2026-10-22", text: "미뤄 둔 전화를 걸었다", quote: followed };

const onPick = jest.fn();
const renderPrompt = (quote: Quote | null, todayDeed: Deed | null, todayQuote: Quote | null) =>
  render(
    <ThemeProvider theme={getTheme("dark")}>
      <DeedPrompt quote={quote} todayDeed={todayDeed} todayQuote={todayQuote} onPick={onPick} />
    </ThemeProvider>
  );

describe("DeedPrompt", () => {
  beforeEach(() => {
    mockPush.mockClear();
    onPick.mockClear();
  });

  it("오늘 따를 문장을 아직 정하지 않았으면 지금 보는 문장으로 정한다", () => {
    renderPrompt(other, null, null);
    fireEvent.press(screen.getByLabelText("오늘 이 문장대로 살기"));
    expect(onPick).toHaveBeenCalledWith(other);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("정한 문장 아래에서는 그 문장으로 한 줄을 남기러 간다", () => {
    renderPrompt(followed, null, followed);
    fireEvent.press(screen.getByLabelText("이 문장대로 한 일 남기기"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/deed",
      params: { quoteId: followed.id, text: followed.text, author: followed.author },
    });
  });

  it("한 줄을 남기기 전에는 다른 문장으로 오늘 따를 문장을 바꿀 수 있다", () => {
    renderPrompt(other, null, followed);
    expect(screen.queryByLabelText("이 문장대로 한 일 남기기")).toBeNull();
    fireEvent.press(screen.getByLabelText("오늘 따를 문장을 이 문장으로 바꾸기"));
    expect(onPick).toHaveBeenCalledWith(other);
  });

  it("한 줄을 남긴 문장 아래에서는 이 문장대로 한 일로 보여 준다", () => {
    renderPrompt(followed, deed, followed);
    expect(screen.getByText(deed.text)).toBeTruthy();
    expect(screen.getByText("오늘 이 문장대로 한 일")).toBeTruthy();
  });

  it("한 줄을 남긴 문장 아래에서 한 줄을 누르면 고치러 간다", () => {
    renderPrompt(followed, deed, followed);
    fireEvent.press(screen.getByLabelText(`오늘의 한 줄: ${deed.text}`));
    expect(mockPush).toHaveBeenCalledWith("/deed");
  });

  it("한 줄을 남긴 뒤 다른 문장에서 바꾸면 바로 바꾸지 않고 그 문장으로 한 줄 쓰기 화면을 연다", () => {
    renderPrompt(other, deed, followed);
    fireEvent.press(screen.getByLabelText("오늘 따를 문장을 이 문장으로 바꾸기"));
    expect(onPick).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/deed",
      params: { quoteId: other.id, text: other.text, author: other.author },
    });
  });
});

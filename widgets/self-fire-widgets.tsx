// ─────────────────────────────────────────────────────────────
// widgets/self-fire-widgets.tsx
// Android 홈 화면 위젯 화면. (react-native-android-widget)
//   - QuoteWidget: 오늘의 명언 + 불씨 상태 (4x2)
//   - FlameWidget: 불씨 상태(연속 일수)만 크게 (2x2)
// 색상·배경 투명도·글자 크기·작가 표시는 설정 > 위젯 꾸미기에서 고른다. (data/widget-style.ts)
// 위젯은 RemoteViews로 그려지므로 일반 RN 컴포넌트·테마 대신 위젯 전용 컴포넌트와 hex 색을 쓴다.
// 이름(QUOTE_WIDGET 등)은 app.json의 react-native-android-widget 플러그인 설정과 같아야 한다.
// ─────────────────────────────────────────────────────────────

import { FlameStatus, WidgetView } from "@/data/widget-snapshot";
import {
  DEFAULT_WIDGET_STYLE,
  getWidgetPalette,
  getWidgetTextScale,
  WidgetStyle,
  withOpacity,
} from "@/data/widget-style";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export const QUOTE_WIDGET = "Quote";
export const FLAME_WIDGET = "Flame";

// 위젯 명언 글꼴 (app.json 플러그인 fonts에 등록한 파일 이름)
const QUOTE_FONT = "NanumMyeongjo_700Bold";

const FLAME_EMOJI: Record<FlameStatus, string> = { lit: "🔥", waiting: "🔥", out: "🪵" };

// 불씨 한 줄 요약 (명언 위젯 상단 배지)
const flameBadgeText = ({ flame, streak }: WidgetView) => {
  if (flame === "out") return "🪵 불씨 꺼짐";
  return `${FLAME_EMOJI[flame]} ${streak}일째`;
};

// 불씨 위젯 아래 안내 문구
const flameCaption = ({ flame }: WidgetView) => {
  switch (flame) {
    case "lit":
      return "오늘도 불씨를 지폈어요";
    case "waiting":
      return "오늘의 불씨를 지펴 주세요";
    case "out":
      return "다시 불씨를 지펴 볼까요?";
  }
};

// 명언 길이·위젯 크기에 맞춘 글자 크기 (긴 명언은 작게). userScale은 꾸미기에서 고른 글자 크기
const quoteFontSize = (text: string, width: number, height: number, userScale = 1) => {
  const base = Math.min(width / 14, height / 6.5, 20);
  const scale = text.length > 90 ? 0.72 : text.length > 55 ? 0.84 : 1;
  return Math.max(11, Math.round(base * scale * userScale));
};

type Props = { view: WidgetView; width: number; height: number; dark?: boolean; style?: WidgetStyle };

export function QuoteWidget({ view, width, height, dark, style = DEFAULT_WIDGET_STYLE }: Props) {
  const c = getWidgetPalette(style.paletteId, !!dark);
  const quote = view.quote ?? { text: "앱을 열어 오늘의 명언을 받아 보세요.", author: "selfFire" };
  const fontSize = quoteFontSize(quote.text, width, height, getWidgetTextScale(style.textSize));
  const lit = view.flame !== "out";

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: withOpacity(c.background, style.opacity),
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 14,
      }}
    >
      <FlexWidget
        style={{ width: "match_parent", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <TextWidget
          text={view.quote?.picked ? "🔥 오늘 따르는 문장" : "오늘의 명언"}
          style={{ fontSize: 12, fontWeight: "700", color: c.muted }}
        />
        <FlexWidget
          style={{
            backgroundColor: lit ? c.flameSoft : withOpacity(c.background, style.opacity),
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <TextWidget
            text={flameBadgeText(view)}
            style={{ fontSize: 12, fontWeight: "700", color: lit ? c.flame : c.muted }}
          />
        </FlexWidget>
      </FlexWidget>

      <TextWidget
        text={quote.text}
        maxLines={Math.max(2, Math.floor((height - (style.showAuthor ? 72 : 52)) / (fontSize * 1.45)))}
        truncate="END"
        style={{
          width: "match_parent",
          fontSize,
          fontFamily: QUOTE_FONT,
          color: c.foreground,
          lineHeight: Math.round(fontSize * 1.45),
        }}
      />

      {style.showAuthor ? (
        <TextWidget
          text={`— ${quote.author}`}
          maxLines={1}
          truncate="END"
          style={{ width: "match_parent", fontSize: 12, color: c.muted, textAlign: "right" }}
        />
      ) : (
        <FlexWidget style={{ height: 1 }} />
      )}
    </FlexWidget>
  );
}

export function FlameWidget({ view, dark, style = DEFAULT_WIDGET_STYLE }: Props) {
  const c = getWidgetPalette(style.paletteId, !!dark);
  const lit = view.flame === "lit";

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: withOpacity(lit ? c.flameSoft : c.background, style.opacity),
        borderRadius: 24,
        padding: 12,
      }}
    >
      <TextWidget text={FLAME_EMOJI[view.flame]} style={{ fontSize: 34 }} />
      <FlexWidget style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
        <TextWidget
          text={String(view.streak)}
          style={{ fontSize: 28, fontWeight: "900", color: view.flame === "out" ? c.muted : c.flame }}
        />
        <TextWidget text=" 일째" style={{ fontSize: 13, fontWeight: "700", color: c.muted, marginBottom: 4 }} />
      </FlexWidget>
      <TextWidget
        text={flameCaption(view)}
        maxLines={2}
        style={{ fontSize: 11, color: c.muted, textAlign: "center", marginTop: 4 }}
      />
    </FlexWidget>
  );
}

// 위젯 이름에 맞는 화면을 라이트/다크 두 벌로 만든다. (시스템 다크 모드에 맞춰 런처가 고른다)
// 꾸미기에서 '자동' 외의 색을 고르면 두 벌이 같은 색이 된다.
export function renderSelfFireWidget(
  widgetName: string,
  view: WidgetView,
  width: number,
  height: number,
  style: WidgetStyle = DEFAULT_WIDGET_STYLE,
) {
  const Widget = widgetName === FLAME_WIDGET ? FlameWidget : QuoteWidget;
  return {
    light: <Widget view={view} width={width} height={height} style={style} />,
    dark: <Widget view={view} width={width} height={height} style={style} dark />,
  };
}

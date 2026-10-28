// ─────────────────────────────────────────────────────────────
// app/(navi)/index.tsx
// 앱 메인 화면 (홈 화면).
// 핵심 기능:
//   - 명언 카드 표시 + 좌우 스와이프로 이전/다음 명언 전환
//   - 필터 모드·카테고리·명언 풀·알림 명언 처리는 hooks/useQuotePager.ts
//   - 기본 명언 로드·동기화는 hooks/useDefaultQuotes.ts
//   - 스트릭 배지를 누르면 나의 모닥불 시트 (테마·글꼴은 사이드바의 꾸미기, app/customize.tsx)
//   - AdMob 배너 광고 (광고 제거 미구매 시)
//   - 첫 실행 주제 고르기 → 명언을 바로 보여 준다 (명언은 들어오는 문)
//   - 카드 바로 아래 '오늘 이 문장대로 살기' → 정한 문장 아래 '오늘 이 문장대로 할 일 정하기' → 할 일 한 가지 작성(app/deed.tsx)
//     → 하루를 지내며 해내면 '완료' → 불씨 점화(Hold to Ignite) → 점화 완료 시트 (모닥불 + 첫 알림 제안).
//     불씨는 명언을 연 날도, 할 일을 정한 날도 아니라 문장대로 해낸 날에 켜진다.
//   - 하단 탭으로 두 공간을 나눈다. (components/home-tab-bar.tsx)
//     오늘: 오늘 따르는 문장 하나에 머문다. (보면서 계속 도전받도록) 할 일 · 완료 · 불씨도 여기서.
//     명언: 언제든 명언을 넘겨 본다. 문장을 고르기 전이면 여기서 고르고, 할 일을 완료한 뒤에도 열 수 있다.
//   - 알림 예약·홈 화면 위젯 갱신 (hooks/useBackgroundRefresh.ts)
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import BannerAd from "@/components/banner-ad";
import CategoryTabs from "@/components/category-tabs";
import DeedPrompt from "@/components/deed-prompt";
import HomeTabBar, { HomeTab } from "@/components/home-tab-bar";
import FeatherIcon, { Ionicon } from "@/components/icon";
import IgniteResultSheet, { IgniteResultSheetHandle } from "@/components/ignite-result-sheet";
import { IgniteScreen } from "@/components/ignite-screen";
import OnboardingTopics from "@/components/onboarding-topics";
import MenuButton from "@/components/menu-button";
import { PickerSheetHandle } from "@/components/picker-sheet";
import QuoteItem from "@/components/quote-items";
import QuoteSwiper from "@/components/quote-swiper";
import StreakBadge from "@/components/streak-badge";
import StreakSheet from "@/components/streak-sheet";
import TodaySteps from "@/components/today-steps";
import { useBackgroundRefresh } from "@/hooks/useBackgroundRefresh";
import { useDailyIgnite } from "@/hooks/useDailyIgnite";
import { useDefaultQuotes } from "@/hooks/useDefaultQuotes";
import { useQuotePager } from "@/hooks/useQuotePager";
import { useStreak } from "@/hooks/useStreak";
import { useSwipeHint } from "@/hooks/useSwipeHint";
import { useAdStore } from "@/store/ad-store";
import { useCategoryStore } from "@/store/category";
import { useDeedStore, useTodayDeed, useTodayQuote } from "@/store/deed";
import { usePendingQuoteStore } from "@/store/notification";
import { useFavoriteQuoteStore } from "@/store/quote";
import { Quote } from "@/models";
import { trackEvent } from "@/utils/analytics";
import { isDeedDone } from "@/utils/deed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Pressable } from "react-native";
import { useShallow } from "zustand/react/shallow";

// 헤더 아래 카테고리 탭 줄의 높이
const CATEGORY_ROW_HEIGHT = 52;
export default function Index() {
  const isAdFree = useAdStore((s) => s.isAdFree);
  const { customQuotes, favorites } = useFavoriteQuoteStore(
    useShallow((s) => ({ customQuotes: s.customQuotes, favorites: s.favorites }))
  );
  const { currentCategoryId, interestIds, hasPickedInterests } = useCategoryStore(
    useShallow((s) => ({
      currentCategoryId: s.currentCategoryId,
      interestIds: s.interestIds,
      hasPickedInterests: s.hasPickedInterests,
    }))
  );
  const { currentStreak } = useStreak();
  const { isIgnited, isFirstVisit, markIgnited } = useDailyIgnite();
  const todayDeed = useTodayDeed();
  // 오늘 따라 살기로 고른 문장 (한 줄을 남겼으면 그 한 줄이 따른 문장)
  const todayQuote = useTodayQuote();
  const pickToday = useDeedStore((s) => s.pickToday);
  const completeToday = useDeedStore((s) => s.completeToday);
  const isTodayDone = !!todayDeed && isDeedDone(todayDeed);
  // 오늘 할 일을 완료했는데 아직 불씨를 지피지 않았으면 점화 화면을 띄운다. (앱을 껐다 켜도 이어진다)
  const showIgnite = !isIgnited && isTodayDone;
  // 아직 한 번도 넘겨 보지 않았으면 오늘의 불씨를 켠 뒤 넘기기 힌트를 보여 준다.
  const { needsHint, markSwiped } = useSwipeHint();
  // 저장한 문장 목록에서 명언을 누르면 view=favorites(+ 그 명언의 quote)로 들어온다.
  const { view, at, quote } = useLocalSearchParams<{ view?: string; at?: string; quote?: string }>();

  const defaultQuotes = useDefaultQuotes();
  const pager = useQuotePager({
    defaultQuotes,
    openFavoritesKey: view === "favorites" ? at : undefined,
    openQuoteId: quote,
    onNext: markSwiped,
    todayQuote,
  });
  const { currentQuote } = pager;

  // 처음 설치한 사용자에게만 명언보다 먼저 주제 고르기를 보여 준다.
  const showOnboarding = isFirstVisit && pager.isCategoryHydrated && !hasPickedInterests;

  useBackgroundRefresh([currentCategoryId, interestIds, favorites, customQuotes, defaultQuotes, currentStreak, isIgnited, todayQuote?.id]);

  const streakSheetRef = useRef<PickerSheetHandle>(null);
  const igniteResultRef = useRef<IgniteResultSheetHandle>(null);

  // 오늘 탭 / 명언 탭. 오늘 따르는 문장이 있으면 오늘 탭에서, 없으면 명언 탭에서 시작한다.
  // 명언 탭으로 가는 때:
  //   - 탭을 누르거나 '다른 문장으로 바꾸기'를 눌렀을 때
  //   - 저장한 문장 목록, 사이드바·알림에서 오늘 따르는 문장이 아닌 문장을 열었을 때
  // 오늘 따를 문장을 정하거나 바꾸면 오늘 탭으로 돌아온다. 명언 탭에서 기기 뒤로 가기를 눌러도 오늘 탭으로.
  const [tab, setTab] = useState<HomeTab>(todayQuote ? "today" : "quotes");
  const canReturnToToday = !!todayQuote && tab === "quotes";

  useEffect(() => {
    if (view === "favorites" && at) setTab("quotes");
  }, [view, at]);

  const todayQuoteId = useRef(todayQuote?.id);
  useEffect(() => {
    if (todayQuoteId.current === todayQuote?.id) return;
    todayQuoteId.current = todayQuote?.id;
    // 오늘 따르는 문장이 바뀌면(고르기·바꾸기, 한 줄 쓰기 화면에서 새 문장으로 한 줄) 오늘 탭으로 돌아온다.
    // 날이 바뀌어 오늘 문장이 없어지면 명언 탭에서 새로 고른다.
    setTab(todayQuote ? "today" : "quotes");
  }, [todayQuote]);
  useEffect(() => {
    const follow = (pending: Quote | null) => {
      if (pending) setTab(pending.id === todayQuoteId.current ? "today" : "quotes");
    };
    follow(usePendingQuoteStore.getState().quote);
    return usePendingQuoteStore.subscribe((s) => follow(s.quote));
  }, []);

  useEffect(() => {
    if (!canReturnToToday) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setTab("today");
      return true;
    });
    return () => sub.remove();
  }, [canReturnToToday]);

  // 명언 탭에서 다른 문장을 넘겨 보며 오늘 따를 문장을 다시 고른다. 오늘 따르는 문장 다음 명언부터 보여 준다.
  const startChange = () => {
    setTab("quotes");
    if (currentQuote?.id === todayQuote?.id) pager.showNextQuote();
  };

  // 지금 보는 명언을 오늘 따를 문장으로 정하거나 바꾼다.
  // (할 일을 정한 뒤에는 DeedPrompt가 여기 대신 할 일 쓰기 화면을 열어 새 문장으로 할 일을 다시 다듬게 한다)
  const handlePick = (picked: Quote) => {
    const isChange = !!todayQuote;
    if (!pickToday(picked)) return;
    setTab("today");
    // 화면이 오늘 따르는 문장으로 바로 바뀌므로 토스트는 띄우지 않는다.
    trackEvent("today_quote_pick", { change: isChange });
  };

  // 오늘 할 일을 해냈다. 완료로 표시하면 점화 화면이 떠서 꾹 눌러 불씨를 지핀다.
  const handleComplete = () => {
    if (!completeToday()) return;
    trackEvent("deed_complete");
  };

  // 점화 애니메이션이 끝나면 오늘의 모닥불을 보여 준다.
  const handleIgnited = async () => {
    const result = await markIgnited();
    igniteResultRef.current?.open(result);
  };

  return (
    <SafeAreaView flex={1} bg="$background">
      <Box flex={1} alignItems="center">
        {/* ── 상단 바 ──
            메뉴 + 연속 점화 스트릭.
            테마·글꼴은 가끔 바꾸는 기능이라 사이드바의 꾸미기(app/customize.tsx)로 옮겼다. */}
        <Box
          width="100%"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          px="lg"
          pt="s"
        >
          <Box flexDirection="row" alignItems="center" gap="s">
            <MenuButton />
            <StreakBadge streak={currentStreak} onPress={() => streakSheetRef.current?.open()} />
          </Box>
        </Box>

        {/* 오늘의 단계: 문장 고르기 → 할 일 정하기 → 해내고 완료 → 불씨. 지금 어디쯤인지와 불씨를 켜는 법을 알려 준다.
            오늘 탭과, 아직 문장을 고르기 전(새날)의 명언 탭에 보여 준다. 문장을 정한 뒤 명언 탭에서는 숨긴다. */}
        {(tab === "today" || !todayQuote) && (
          <TodaySteps picked={!!todayQuote} planned={!!todayDeed} completed={isTodayDone} ignited={isTodayDone && isIgnited} />
        )}

        {tab === "today" && todayQuote ? (
          <>
            {/* 오늘 따르는 문장 하나와 오늘의 한 줄. 넘기지 않고 이 문장에 머문다.
                오늘의 한 줄은 화면 폭 전체로 크게, 저장·공유는 그 아래 '다른 문장으로 바꾸기'와 한 줄에 둔다. */}
            <Box flex={1} width="100%" overflow="hidden" pb="md">
              <QuoteItem
                key={todayQuote.id}
                {...todayQuote}
                isCustom={customQuotes.some((q) => q.id === todayQuote.id)}
                isTodaysQuote
                footerStacked
                footer={
                  <DeedPrompt
                    quote={todayQuote}
                    todayDeed={todayDeed}
                    todayQuote={todayQuote}
                    onPick={handlePick}
                    onComplete={handleComplete}
                    wide
                  />
                }
                actionsLeading={
                  // 완료 전까지는 바꿀 수 있다. (할 일을 정한 뒤면 새 문장으로 할 일을 다시 다듬는다)
                  // 완료한 뒤에는 문장을 바꾸지 않는다. 다른 명언은 명언 탭에서 본다.
                  !isTodayDone && (
                  <Pressable
                    onPress={startChange}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="다른 문장으로 바꾸기"
                    accessibilityHint="명언 탭에서 명언을 넘겨 보며 오늘 따를 문장을 다시 고릅니다"
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: "flex-start", paddingVertical: 12 })}
                  >
                    <Box flexDirection="row" alignItems="center" gap="xs">
                      <FeatherIcon name="repeat" size={14} color="$muted" />
                      <Text variant="caption" fontSize={14}>
                        다른 문장으로 바꾸기
                      </Text>
                    </Box>
                  </Pressable>
                  )
                }
              />
            </Box>
          </>
        ) : tab === "today" ? (
          // 아직 오늘 따를 문장을 고르지 않았다. 명언 탭에서 고르도록 안내한다.
          <Box flex={1} width="100%" alignItems="center" justifyContent="center" px="xl" style={{ gap: 16 }}>
            <Ionicon name="flame-outline" size={40} color="$muted" />
            <Text fontSize={17} fontWeight="800" textAlign="center">
              아직 오늘 따를 문장이 없어요
            </Text>
            <Text variant="caption" fontSize={14} textAlign="center">
              명언을 넘겨 보며 오늘 이 문장대로 살 문장 하나를 골라 보세요
            </Text>
            <Pressable
              onPress={() => setTab("quotes")}
              accessibilityRole="button"
              accessibilityLabel="명언 보러 가기"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Box flexDirection="row" alignItems="center" bg="$flame" height={48} px="lg" borderRadius="pill" gap="s">
                <Ionicon name="book" size={17} color="$onPrimary" />
                <Text color="$onPrimary" fontSize={15} fontWeight="800">
                  명언 보러 가기
                </Text>
              </Box>
            </Pressable>
          </Box>
        ) : (
          <>
            {/* 무엇을 볼지 고르는 칩. 누르면 전체 · 저장한 문장 · 내 명언 · 주제 탭으로 펼쳐진다. */}
            <Box width="100%" height={CATEGORY_ROW_HEIGHT} justifyContent="center">
              <CategoryTabs
                selectedId={pager.selectedId}
                onSelect={pager.selectCategory}
                favoritesCount={favorites.length}
                collapseKey={currentQuote?.id}
                hasInterests={interestIds.length > 0}
              />
            </Box>

            {/* 명언 카드 (좌우 스와이프) */}
            <QuoteSwiper
              quote={currentQuote}
              isCustom={!!currentQuote && customQuotes.some((q) => q.id === currentQuote.id)}
              canGoPrev={pager.canGoPrev}
              canGoNext={pager.canGoNext}
              onNext={pager.showNextQuote}
              onPrev={pager.showPrevQuote}
              showSwipeHint={needsHint && !showIgnite && !showOnboarding}
              // 이 문장대로 한 일 한 줄 (남겼으면 오늘의 한 줄): 읽은 문장 바로 아래에 붙여 둔다
              isTodaysQuote={!!currentQuote && currentQuote.id === todayQuote?.id}
              cardFooter={
                <DeedPrompt
                  quote={currentQuote}
                  todayDeed={todayDeed}
                  todayQuote={todayQuote}
                  onPick={handlePick}
                  onComplete={handleComplete}
                />
              }
            />
          </>
        )}
      </Box>

      {!isAdFree && <BannerAd />}

      <HomeTabBar selected={tab} onSelect={setTab} />

      <StreakSheet ref={streakSheetRef} />
      <IgniteResultSheet ref={igniteResultRef} />

      {/* 오늘의 한 줄로 불씨를 직접 켜는 오버레이 */}
      {showIgnite && <IgniteScreen onIgnited={handleIgnited} deedText={todayDeed.text} />}

      {/* 처음 설치했을 때 한 번: 주제 고르기 (고르면 명언으로 이어진다) */}
      {showOnboarding && <OnboardingTopics />}
    </SafeAreaView>
  );
}

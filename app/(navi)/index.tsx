// ─────────────────────────────────────────────────────────────
// app/(navi)/index.tsx
// 앱 메인 화면 (홈 화면).
// 핵심 기능:
//   - 명언 카드 표시 + 좌우 스와이프로 이전/다음 명언 전환
//   - 필터 모드·카테고리·명언 풀·알림 명언 처리는 hooks/useQuotePager.ts
//   - 기본 명언 로드·동기화는 hooks/useDefaultQuotes.ts
//   - 테마/폰트 변경 바텀시트, 스트릭 배지를 누르면 나의 모닥불 시트
//   - AdMob 배너 광고 (광고 제거 미구매 시)
//   - 첫 실행 주제 고르기 → 명언을 바로 보여 준다 (명언은 들어오는 문)
//   - 카드 아래 '이 문장대로 한 일 남기기' → 한 줄 작성(app/deed.tsx) → 그 한 줄로 불씨 점화(Hold to Ignite)
//     → 점화 완료 시트 (모닥불 + 첫 알림 제안). 불씨는 명언을 연 날이 아니라 문장대로 산 날에 켜진다.
//   - 알림 예약·홈 화면 위젯 갱신 (hooks/useBackgroundRefresh.ts)
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView } from "@/atom";
import BannerAd from "@/components/banner-ad";
import CategoryTabs from "@/components/category-tabs";
import DeedPrompt from "@/components/deed-prompt";
import FontPicker from "@/components/font-picker";
import HeaderIconButton from "@/components/header-icon-button";
import FeatherIcon from "@/components/icon";
import IgniteResultSheet, { IgniteResultSheetHandle } from "@/components/ignite-result-sheet";
import { IgniteScreen } from "@/components/ignite-screen";
import OnboardingTopics from "@/components/onboarding-topics";
import MenuButton from "@/components/menu-button";
import { PickerSheetHandle } from "@/components/picker-sheet";
import QuoteSwiper from "@/components/quote-swiper";
import StreakBadge from "@/components/streak-badge";
import StreakSheet from "@/components/streak-sheet";
import ThemePicker from "@/components/theme-picker";
import { useBackgroundRefresh } from "@/hooks/useBackgroundRefresh";
import { useDailyIgnite } from "@/hooks/useDailyIgnite";
import { useDefaultQuotes } from "@/hooks/useDefaultQuotes";
import { useQuotePager } from "@/hooks/useQuotePager";
import { useStreak } from "@/hooks/useStreak";
import { useSwipeHint } from "@/hooks/useSwipeHint";
import { useAdStore } from "@/store/ad-store";
import { useCategoryStore } from "@/store/category";
import { useTodayDeed } from "@/store/deed";
import { useFavoriteQuoteStore } from "@/store/quote";
import { useLocalSearchParams } from "expo-router";
import { useRef } from "react";
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
  // 오늘의 한 줄을 남겼는데 아직 불씨를 지피지 않았으면 점화 화면을 띄운다. (앱을 껐다 켜도 이어진다)
  const showIgnite = !isIgnited && !!todayDeed;
  // 아직 한 번도 넘겨 보지 않았으면 오늘의 불씨를 켠 뒤 넘기기 힌트를 보여 준다.
  const { needsHint, markSwiped } = useSwipeHint();
  // 사이드바·보관함 목록에서 명언을 누르면 view=favorites(+ 그 명언의 quote)로 들어온다.
  const { view, at, quote } = useLocalSearchParams<{ view?: string; at?: string; quote?: string }>();

  const defaultQuotes = useDefaultQuotes();
  const pager = useQuotePager({
    defaultQuotes,
    openFavoritesKey: view === "favorites" ? at : undefined,
    openQuoteId: quote,
    onNext: markSwiped,
  });
  const { currentQuote, filterMode } = pager;
  const isFavoritesMode = filterMode === "favorites";

  // 처음 설치한 사용자에게만 명언보다 먼저 주제 고르기를 보여 준다.
  const showOnboarding = isFirstVisit && pager.isCategoryHydrated && !hasPickedInterests;

  useBackgroundRefresh([currentCategoryId, interestIds, favorites, customQuotes, defaultQuotes, currentStreak, isIgnited]);

  const themePickerRef = useRef<PickerSheetHandle>(null);
  const fontPickerRef = useRef<PickerSheetHandle>(null);
  const streakSheetRef = useRef<PickerSheetHandle>(null);
  const igniteResultRef = useRef<IgniteResultSheetHandle>(null);

  // 점화 애니메이션이 끝나면 오늘의 모닥불을 보여 준다.
  const handleIgnited = async () => {
    const result = await markIgnited();
    igniteResultRef.current?.open(result);
  };

  return (
    <SafeAreaView flex={1} bg="$background">
      <Box flex={1} alignItems="center">
        {/* ── 상단 바 ──
            왼쪽: 메뉴 + 연속 점화 스트릭 / 오른쪽: 테마 · 글꼴 */}
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

          <Box
            flexDirection="row"
            alignItems="center"
            bg="$surface"
            borderWidth={1}
            borderColor="$border"
            borderRadius="pill"
          >
            <HeaderIconButton bare accessibilityLabel="테마" onPress={() => themePickerRef.current?.open()}>
              <FeatherIcon name="image" size={19} />
            </HeaderIconButton>

            <HeaderIconButton bare accessibilityLabel="글꼴" onPress={() => fontPickerRef.current?.open()}>
              <FeatherIcon name="type" size={19} />
            </HeaderIconButton>
          </Box>
        </Box>

        {/* 무엇을 볼지 고르는 칩. 누르면 전체 · 불씨 보관함 · 내 명언 · 주제 탭으로 펼쳐진다. */}
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
          // 불씨 보관함은 다시 보려고 모아 둔 목록이라 '새 명언으로' 버튼을 띄우지 않는다.
          isRevisit={!isFavoritesMode && pager.currentIndex < pager.maxIndex}
          canGoPrev={pager.canGoPrev}
          canGoNext={pager.canGoNext}
          onNext={pager.showNextQuote}
          onPrev={pager.showPrevQuote}
          onJumpToLatest={pager.showLatestQuote}
          showSwipeHint={needsHint && !showIgnite && !showOnboarding}
        />

        {/* 이 문장대로 한 일 한 줄 (남겼으면 오늘의 한 줄) */}
        <Box width="100%" px="lg" pb="md">
          <DeedPrompt quote={currentQuote} todayDeed={todayDeed} />
        </Box>
      </Box>

      {!isAdFree && <BannerAd />}

      <ThemePicker ref={themePickerRef} />
      <FontPicker ref={fontPickerRef} />
      <StreakSheet ref={streakSheetRef} />
      <IgniteResultSheet ref={igniteResultRef} />

      {/* 오늘의 한 줄로 불씨를 직접 켜는 오버레이 */}
      {showIgnite && <IgniteScreen onIgnited={handleIgnited} deedText={todayDeed.text} />}

      {/* 처음 설치했을 때 한 번: 주제 고르기 (고르면 명언으로 이어진다) */}
      {showOnboarding && <OnboardingTopics />}
    </SafeAreaView>
  );
}

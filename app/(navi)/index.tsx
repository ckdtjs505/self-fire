// ─────────────────────────────────────────────────────────────
// app/(navi)/index.tsx
// 앱 메인 화면 (홈 화면).
// 핵심 기능:
//   - 명언 카드 표시 (페이드 인/아웃 애니메이션)
//   - 좌/우 탭으로 이전/다음 명언 전환
//   - 필터 모드: 전체 / 내가 쓴 명언 / 즐겨찾기
//   - 명언 풀(pool) 관리: 초기 50개 샘플링, 끝에 도달 시 추가 로드
//   - 테마/폰트 변경 바텀시트
//   - AdMob 배너 광고 (광고 제거 미구매 시)
//   - Android 오버레이 권한 최초 요청 (잠금 해제 자동 실행용)
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import HeaderLeft from "@/components/header-left";
import FeatherIcon from "@/components/icon";
import QuoteItem from "@/components/quote-items";
import ThemePicker from "@/components/theme-picker";
import FontPicker from "@/components/font-picker";
import StreakBadge from "@/components/streak-badge";
import { getQuote, quotes as fallbackQuotes } from "@/data/quotes";
import { ActivityIndicator } from "react-native";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { useStreak } from "@/hooks/useStreak";
import { router } from "expo-router";
import { useRef, useState, useEffect, useMemo } from "react";
import { Pressable, Dimensions, Alert, Platform, Animated } from "react-native";
import Toast from 'react-native-toast-message';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as IntentLauncher from "expo-intent-launcher";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdStore } from "@/store/ad-store";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

// 화면 너비: 좌/우 터치 영역 분기 계산에 사용
const { width } = Dimensions.get('window');

export default function Index() {
  const [defaultQuotesState, setDefaultQuotesState] = useState<Quote[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  // 광고 제거 여부 확인
  const { isAdFree } = useAdStore();
  // 사용자가 작성한 커스텀 명언 목록과 즐겨찾기 ID 목록
  const { customQuotes, favorites } = useFavoriteQuoteStore();
  // 연속 방문 스트릭 카운트
  const { currentStreak } = useStreak();

  // 테마 / 폰트 선택 바텀시트 모달 참조
  const refThemePicker = useRef<BottomSheetModal>(null);
  const refFontPicker = useRef<BottomSheetModal>(null);

  // 배너 광고 로드 완료 여부 (로드 전까지 광고 영역을 숨긴다)
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  // 현재 필터 모드: 'all'(전체) | 'mine'(내가 쓴 명언) | 'favorites'(즐겨찾기)
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'favorites'>('all');

  // ── initQuotes (Bulk Fetch & Cache) ────────────────────────
  useEffect(() => {
    const initQuotes = async () => {
      try {
        // 1. AsyncStorage에서 캐시 확인
        const cachedStr = await AsyncStorage.getItem('cached_all_quotes');
        if (cachedStr) {
          const cachedQuotes = JSON.parse(cachedStr);
          setDefaultQuotesState(cachedQuotes);
          setIsGlobalLoading(false);
          // TODO: 백그라운드에서 버전 체크 로직 추가 가능 (API가 지원한다면)
          return;
        }

        // 2. 캐시가 없으면 API에서 1만 개 데이터 한 번에 Fetch
        const response = await fetch('https://ckdtjst505.mycafe24.com/api/quote/get_all.php');
        const json = await response.json();
        
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          // ID를 string으로 변환
          const fetchedQuotes = json.data.map((item: any) => ({
            id: String(item.id),
            text: item.text,
            author: item.author
          }));
          
          // 3. AsyncStorage에 캐싱
          await AsyncStorage.setItem('cached_all_quotes', JSON.stringify(fetchedQuotes));
          setDefaultQuotesState(fetchedQuotes);
        } else {
          // 실패 시 fallback 데이터 사용
          setDefaultQuotesState(fallbackQuotes);
        }
      } catch (error) {
        console.error('Failed to fetch/cache quotes:', error);
        // 에러 발생 시 fallback 데이터 사용
        setDefaultQuotesState(fallbackQuotes);
      } finally {
        setIsGlobalLoading(false);
      }
    };

    initQuotes();
  }, []);

  // 데이터가 페치/캐시된 후 pool을 다시 세팅한다.
  useEffect(() => {
    if (defaultQuotesState.length > 0 && quotes.length === 0) {
      setQuotes(getInitialPool(filterMode));
    }
  }, [defaultQuotesState]);

  // ── shuffle ────────────────────────────────────────────────
  // Fisher-Yates 알고리즘으로 배열을 무작위로 섞는 유틸리티 함수
  const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // 현재 표시 중인 명언 목록
  const [quotes, setQuotes] = useState<Quote[]>([]);
  // 현재 보고 있는 명언의 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  // 현재 세션에서 가장 멀리 진행한 인덱스 (이전 명언 뱃지 표시용)
  const [maxIndex, setMaxIndex] = useState(0);
  // 페이드 애니메이션 값 (0: 투명, 1: 불투명)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // ── getInitialPool ────────────────────────────────────────
  // 필터 모드에 따라 명언 풀을 생성하여 반환한다.
  //   - 'all': 기본 + 커스텀 명언 전체에서 무작위 50개 샘플링
  //   - 'mine': 커스텀 명언만 셔플
  //   - 'favorites': 즐겨찾기에 포함된 명언만 셔플
  const getInitialPool = (mode: 'all' | 'mine' | 'favorites') => {
    let pool: Quote[] = [
      ...defaultQuotesState,
      ...customQuotes
    ];

    if (mode === 'mine') {
      // 내가 쓴 명언만 필터링
      pool = customQuotes;
      return shuffle(pool);
    } else if (mode === 'favorites') {
      // 즐겨찾기만 필터링
      pool = pool.filter(q => favorites.includes(q.id));
      return shuffle(pool);
    } else {
      // 전체 명언: 무작위로 50개 샘플링하여 셔플
      return shuffle(pool).slice(0, 50);
    }
  };

  // 각 필터 모드별로 보던 명언 상태를 유지하기 위한 저장소
  const savedStates = useRef<Record<string, { quotes: Quote[], currentIndex: number, maxIndex: number }>>({
    all: { quotes: [], currentIndex: 0, maxIndex: 0 },
    mine: { quotes: [], currentIndex: 0, maxIndex: 0 },
    favorites: { quotes: [], currentIndex: 0, maxIndex: 0 },
  });
  const currentStateRef = useRef({ quotes, currentIndex, maxIndex });
  const prevFilterMode = useRef(filterMode);

  // 현재 상태 최신화
  useEffect(() => {
    currentStateRef.current = { quotes, currentIndex, maxIndex };
  }, [quotes, currentIndex, maxIndex]);

  // 필터 모드가 변경될 때 이전 모드의 상태를 저장하고, 새 모드의 상태를 복원한다.
  useEffect(() => {
    if (prevFilterMode.current !== filterMode) {
      // 1. 이전 상태 저장
      savedStates.current[prevFilterMode.current] = currentStateRef.current;
      
      // 2. 새 상태 복원 (이전에 본 적이 있으면 복원, 없으면 새로 풀을 가져옴)
      const saved = savedStates.current[filterMode];
      if (saved && saved.quotes.length > 0) {
        if (filterMode === 'favorites') {
          // 즐겨찾기 해제된 항목을 걸러냄
          const validQuotes = saved.quotes.filter(q => favorites.includes(q.id));
          if (validQuotes.length > 0) {
            setQuotes(validQuotes);
            setCurrentIndex(Math.min(saved.currentIndex, validQuotes.length - 1));
            setMaxIndex(Math.min(saved.maxIndex, validQuotes.length - 1));
          } else {
            setQuotes(getInitialPool(filterMode));
            setCurrentIndex(0);
            setMaxIndex(0);
          }
        } else {
          setQuotes(saved.quotes);
          setCurrentIndex(saved.currentIndex);
          setMaxIndex(saved.maxIndex);
        }
      } else {
        setQuotes(getInitialPool(filterMode));
        setCurrentIndex(0);
        setMaxIndex(0);
      }
      fadeAnim.setValue(1);
      prevFilterMode.current = filterMode;
    } else {
      // 초기 렌더링 시
      if (quotes.length === 0) {
        setQuotes(getInitialPool(filterMode));
        setCurrentIndex(0);
        setMaxIndex(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode]);

  // ── loadMoreQuotes ────────────────────────────────────────
  // '전체' 모드에서 목록 끝에 가까워질 때 아직 보지 않은 명언을 20개씩 추가 로드한다.
  // 필터 모드에서는 기존 데이터만 보여주므로 추가 로드하지 않는다.
  const loadMoreQuotes = () => {
    if (filterMode !== 'all') return; // 필터 모드에서는 더 불러오지 않음 (기존 데이터만 보여줌)

    setQuotes(prevQuotes => {
      const fullPool = [...defaultQuotesState, ...customQuotes];
      const currentIds = new Set(prevQuotes.map(q => q.id));
      // 이미 풀에 포함되지 않은 명언만 추가 후보로 선택
      const unused = fullPool.filter(q => !currentIds.has(q.id));

      if (unused.length > 0) {
        const nextBatch = shuffle(unused).slice(0, 20);
        return [...prevQuotes, ...nextBatch];
      }
      return prevQuotes;
    });
  };

  // ── goToNextQuote ─────────────────────────────────────────
  // 다음 명언으로 전환한다.
  // 페이드 아웃 → 인덱스 변경 → 페이드 인 순서로 애니메이션 처리.
  // 목록 끝에 가까워지면 loadMoreQuotes를 호출해 명언을 추가 로드한다.
  const goToNextQuote = () => {
    if (quotes.length === 0) return;

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((prev) => {
        let nextIndex = prev + 1;
        
        // 목록 끝에 2개 이내로 남으면 추가 로드 트리거
        if (nextIndex >= quotes.length - 2) {
          loadMoreQuotes();
        }
        
        if (nextIndex >= quotes.length) {
          nextIndex = 0; // 맨 끝이면 처음으로 (즐겨찾기/내가 쓴 명언 등에서)
        }
        // 최대 진행 인덱스 갱신 (이전 명언 뱃지 표시에 사용)
        setMaxIndex(prevMax => Math.max(prevMax, nextIndex));
        return nextIndex;
      });

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  // ── goToPrevQuote ─────────────────────────────────────────
  // 이전 명언으로 전환한다.
  // 첫 번째 명언(index 0)에서는 동작하지 않는다.
  const goToPrevQuote = () => {
    if (quotes.length === 0 || currentIndex === 0) return;

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  // ── 오버레이 권한 최초 요청 (Android) ────────────────────
  // 앱 최초 실행 시(hasPromptedOverlay 키 없을 때) 1초 뒤에 다이얼로그를 표시한다.
  // 잠금 해제 시 명언을 자동으로 띄우는 '다른 앱 위에 표시' 권한 요청용.
  useEffect(() => {
    const requestOverlayPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const hasPrompted = await AsyncStorage.getItem('hasPromptedOverlay');
          if (!hasPrompted) {
            Alert.alert(
              "화면 자동 켜짐 설정",
              "휴대폰 잠금 해제 시 명언을 자동으로 띄우려면 '다른 앱 위에 표시' 권한이 필요합니다. 설정 화면으로 이동하시겠습니까?",
              [
                { text: "나중에", style: "cancel", onPress: () => AsyncStorage.setItem('hasPromptedOverlay', 'true') },
                {
                  text: "설정하러 가기",
                  onPress: async () => {
                    await AsyncStorage.setItem('hasPromptedOverlay', 'true');
                    IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_OVERLAY_PERMISSION);
                  }
                }
              ]
            );
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    setTimeout(requestOverlayPermission, 1000); // 1초 뒤에 띄움 (로딩 안정화)
  }, []);

  if (isGlobalLoading) {
    return (
      <SafeAreaView flex={1}>
        <Box bg="$background" flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text mt="md" color="$foreground">명언 데이터를 불러오는 중...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView flex={1}>
      <Box
        bg="$background"
        flex={1}
        justifyContent={"center"}
        alignItems={"center"}
      >
        {/* 좌측 상단: 연속 방문 스트릭 뱃지 */}
        <HeaderLeft>
          <StreakBadge streak={currentStreak} />
        </HeaderLeft>

        {/* 우측 상단: 필터 버튼 / 테마 버튼 / 폰트 버튼 */}
        <Box
          position={"absolute"}
          top={0}
          right={0}
          m="s"
          p="xs"
          minHeight={44}
          width={180}
          justifyContent={"space-around"}
          alignItems={"center"}
          flexDirection={"row"}
          zIndex={10}
        >
          {/* 내가 작성한 명언 필터 버튼
              - 커스텀 명언이 없으면 안내 토스트를 표시하고 전환 불가
              - 활성화 시 파란색 배경으로 강조 */}
          <Pressable
            onPress={() => {
              if (filterMode !== 'mine' && customQuotes.length === 0) {
                Toast.show({
                  type: 'info',
                  text1: '알림',
                  text2: '아직 직접 작성한 명언이 없습니다. 명언을 먼저 등록해 보세요!',
                });
                return;
              }
              // 이미 활성화된 경우 전체 모드로 복귀, 아니면 mine 모드 진입
              setFilterMode(filterMode === 'mine' ? 'all' : 'mine');
            }}
          >
            <Box
              borderRadius="hg"
              width={40}
              height={40}
              justifyContent="center"
              alignItems="center"
              backgroundColor={filterMode === 'mine' ? "$primary" : "$sidebarBackground"}
              style={{
                shadowColor: filterMode === 'mine' ? "#4F46E5" : "#000",
                shadowOpacity: filterMode === 'mine' ? 0.3 : 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <FeatherIcon
                name={filterMode === 'mine' ? "user-check" : "user"}
                size={20}
                color={filterMode === 'mine' ? "white" : "$foreground"}
              />
            </Box>
          </Pressable>

          {/* 즐겨찾기 명언 필터 버튼
              - 즐겨찾기가 없으면 안내 토스트를 표시하고 전환 불가
              - 활성화 시 빨간색 배경으로 강조 */}
          <Pressable
            onPress={() => {
              if (filterMode !== 'favorites' && favorites.length === 0) {
                Toast.show({
                  type: 'info',
                  text1: '알림',
                  text2: '아직 즐겨찾기한 명언이 없습니다. 먼저 명언에 하트를 눌러보세요!',
                });
                return;
              }
              // 이미 활성화된 경우 전체 모드로 복귀, 아니면 favorites 모드 진입
              setFilterMode(filterMode === 'favorites' ? 'all' : 'favorites');
            }}
          >
            <Box
              borderRadius="hg"
              width={40}
              height={40}
              justifyContent="center"
              alignItems="center"
              backgroundColor={filterMode === 'favorites' ? "red" : "$sidebarBackground"}
              style={{
                shadowColor: filterMode === 'favorites' ? "red" : "#000",
                shadowOpacity: filterMode === 'favorites' ? 0.3 : 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <FeatherIcon
                name={filterMode === 'favorites' ? "heart" : "heart"}
                size={20}
                color={filterMode === 'favorites' ? "white" : "$foreground"}
              />
            </Box>
          </Pressable>

          {/* 테마(배경색/이미지) 변경 버튼 */}
          <Pressable onPress={() => refThemePicker.current?.open()}>
            <Box
              borderRadius="hg"
              width={40}
              height={40}
              justifyContent="center"
              alignItems="center"
              backgroundColor="$sidebarBackground"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <FeatherIcon name="image" size={20}></FeatherIcon>
            </Box>
          </Pressable>

          {/* 폰트 변경 버튼 */}
          <Pressable onPress={() => refFontPicker.current?.open()}>
            <Box
              borderRadius="hg"
              width={40}
              height={40}
              justifyContent="center"
              alignItems="center"
              backgroundColor="$sidebarBackground"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <FeatherIcon name="type" size={20}></FeatherIcon>
            </Box>
          </Pressable>
        </Box>

        {/* ── 명언 카드 영역 ──────────────────────────────────
            화면 좌측 절반 탭 → 이전 명언 / 우측 절반 탭 → 다음 명언 */}
        <Pressable 
          style={{ flex: 1, width: '100%' }} 
          onPress={(e) => {
            const { pageX } = e.nativeEvent;
            if (pageX < width / 2) {
              goToPrevQuote(); // 왼쪽 탭: 이전 명언
            } else {
              goToNextQuote(); // 오른쪽 탭: 다음 명언
            }
          }}
        >
          {/* 이전 명언 표시 뱃지
              현재 인덱스가 최대 진행 인덱스보다 작을 때(뒤로 돌아온 상태) 표시 */}
          {currentIndex < maxIndex && (
            <Box
              position="absolute"
              top={70}
              alignSelf="center"
              bg="$sidebarBackground"
              px="md"
              py="xs"
              borderRadius="hg"
              zIndex={20}
              pointerEvents="none"
              borderWidth={1}
              borderColor="$foreground"
              opacity={0.6}
            >
              <Text fontSize={12} color="$foreground" fontWeight="bold">
                이전에 본 명언
              </Text>
            </Box>
          )}

          {/* 현재 명언 카드 (페이드 + 스케일 애니메이션 적용) */}
          <Box flex={1} width="100%" justifyContent="center" alignItems="center">
            {quotes.length > 0 && quotes[currentIndex] && (
              <Animated.View style={{ 
                opacity: fadeAnim, 
                transform: [{
                  // 페이드 시 살짝 축소되는 효과 (0.96 → 1.0)
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1]
                  })
                }],
                flex: 1, 
                width: '100%' 
              }}>
                <QuoteItem
                  key={`${quotes[currentIndex].id}-${currentIndex}`}
                  {...quotes[currentIndex]}
                  // 커스텀 명언 여부를 판별하여 QuoteItem에 전달 (편집 버튼 표시 등에 활용)
                  isCustom={customQuotes.some(cq => cq.id === quotes[currentIndex].id)}
                />
              </Animated.View>
            )}
          </Box>
        </Pressable>
      </Box>

      {/* ── 배너 광고 영역 ────────────────────────────────────
          광고 제거를 구매하지 않은 경우에만 표시한다.
          광고 로드 완료 전까지는 opacity 0으로 숨겨 레이아웃 깜빡임을 방지한다. */}
      {!isAdFree && (
        <Box
          alignItems="center"
          justifyContent="center"
          width={width}
          minHeight={60}
          opacity={isAdLoaded ? 1 : 0}
          pointerEvents={isAdLoaded ? "auto" : "none"}
        >
          <BannerAd
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            // 개발 환경에서는 테스트 광고 ID를 사용한다.
            unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-3739053005473702/4339756170"}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true, // 비개인화 광고 요청
            }}
            onAdLoaded={() => {
              console.log('Ad loaded successfully');
              setIsAdLoaded(true);
            }}
            onAdFailedToLoad={(error) => {
              console.log('Ad failed to load: ', error);
              setIsAdLoaded(false);
            }}
          />
        </Box>
      )}

      {/* 테마 선택 바텀시트 */}
      <ThemePicker ref={refThemePicker} />
      {/* 폰트 선택 바텀시트 */}
      <FontPicker ref={refFontPicker} />
    </SafeAreaView>
  );
}

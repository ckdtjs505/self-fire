import { Box, SafeAreaView, Text } from "@/atom";
import HeaderLeft from "@/components/header-left";
import FeatherIcon from "@/components/icon";
import QuoteItem from "@/components/quote-items";
import ThemePicker from "@/components/theme-picker";
import FontPicker from "@/components/font-picker";
import StreakBadge from "@/components/streak-badge";
import { getQuote, quotes as defaultQuotes } from "@/data/quotes";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { useStreak } from "@/hooks/useStreak";
import { router } from "expo-router";
import { useRef, useState, useEffect, useMemo } from "react";
import { Pressable, Dimensions, Alert, Platform, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as IntentLauncher from "expo-intent-launcher";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdStore } from "@/store/ad-store";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const { width } = Dimensions.get('window');

export default function Index() {
  const { isAdFree } = useAdStore();
  const { customQuotes, favorites } = useFavoriteQuoteStore();
  const { currentStreak } = useStreak();
  const refThemePicker = useRef<BottomSheetModal>(null);
  const refFontPicker = useRef<BottomSheetModal>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'favorites'>('all');

  // 리스트를 무작위로 섞는 유틸리티 함수
  const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 명언 풀 생성 및 관리
  const getInitialPool = (mode: 'all' | 'mine' | 'favorites') => {
    let pool: Quote[] = [
      ...defaultQuotes,
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

  useEffect(() => {
    // 필터 상태가 바뀌거나 데이터가 바뀌면 풀 초기화
    setQuotes(getInitialPool(filterMode));
    setCurrentIndex(0);
    setMaxIndex(0);
    fadeAnim.setValue(1);
  }, [filterMode, customQuotes, favorites]);

  // '전체 명언' 모드에서 끝에 도달했을 때 추가로 불러올 수 있는 함수
  const loadMoreQuotes = () => {
    if (filterMode !== 'all') return; // 필터 모드에서는 더 불러오지 않음 (기존 데이터만 보여줌)

    setQuotes(prevQuotes => {
      const fullPool = [...defaultQuotes, ...customQuotes];
      const currentIds = new Set(prevQuotes.map(q => q.id));
      const unused = fullPool.filter(q => !currentIds.has(q.id));

      if (unused.length > 0) {
        const nextBatch = shuffle(unused).slice(0, 20);
        return [...prevQuotes, ...nextBatch];
      }
      return prevQuotes;
    });
  };

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
        
        if (nextIndex >= quotes.length - 2) {
          loadMoreQuotes();
        }
        
        if (nextIndex >= quotes.length) {
          nextIndex = 0; // 맨 끝이면 처음으로 (즐겨찾기/내가 쓴 명언 등에서)
        }
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

  return (
    <SafeAreaView flex={1}>
      <Box
        bg="$background"
        flex={1}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <HeaderLeft>
          <StreakBadge streak={currentStreak} />
        </HeaderLeft>
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
          {/* 내가 작성한 명언 필터 */}
          <Pressable
            onPress={() => {
              if (filterMode !== 'mine' && customQuotes.length === 0) {
                Alert.alert("알림", "아직 직접 작성한 명언이 없습니다. 명언을 먼저 등록해 보세요!");
                return;
              }
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

          {/* 즐겨찾기 명언 필터 */}
          <Pressable
            onPress={() => {
              if (filterMode !== 'favorites' && favorites.length === 0) {
                Alert.alert("알림", "아직 즐겨찾기한 명언이 없습니다. 먼저 명언에 하트를 눌러보세요!");
                return;
              }
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

        <Pressable 
          style={{ flex: 1, width: '100%' }} 
          onPress={(e) => {
            const { pageX } = e.nativeEvent;
            if (pageX < width / 2) {
              goToPrevQuote();
            } else {
              goToNextQuote();
            }
          }}
        >
          {/* 이전 명언 표시 뱃지 */}
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

          <Box flex={1} width="100%" justifyContent="center" alignItems="center">
            {quotes.length > 0 && quotes[currentIndex] && (
              <Animated.View style={{ 
                opacity: fadeAnim, 
                transform: [{
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
                  isCustom={customQuotes.some(cq => cq.id === quotes[currentIndex].id)}
                />
              </Animated.View>
            )}
          </Box>
        </Pressable>
      </Box>
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
            unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-3739053005473702/4339756170"}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
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
      <ThemePicker ref={refThemePicker} />
      <FontPicker ref={refFontPicker} />
    </SafeAreaView>
  );
}

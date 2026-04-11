import { Box, SafeAreaView } from "@/atom";
import HeaderLeft from "@/components/header-left";
import FeatherIcon from "@/components/icon";
import QuoteItem from "@/components/quote-items";
import ThemePicker from "@/components/theme-picker";
import { getQuote, quotes as defaultQuotes } from "@/data/quotes";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { router } from "expo-router";
import { useRef, useState, useEffect, useMemo } from "react";
import { Pressable, Dimensions, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as IntentLauncher from "expo-intent-launcher";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import Swiper from "react-native-swiper";
import { useAdStore } from "@/store/ad-store";

const { width } = Dimensions.get('window');

export default function Index() {
  const { isAdFree } = useAdStore();
  const { customQuotes } = useFavoriteQuoteStore();
  const refThemePicker = useRef<any>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  // 모든 명언을 합친 리스트 (기본 + 사용자 커스텀)
  // isCustom 플래그를 추가하여 전달
  const getRandomQuote = () => {
    const combined = [
      ...defaultQuotes.map(q => ({ ...q, isCustom: false })),
      ...customQuotes.map(q => ({ ...q, isCustom: true }))
    ];
    const randomIndex = Math.floor(Math.random() * combined.length);
    return combined[randomIndex];
  };

  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    // 초기 명언 로드
    setQuotes([getRandomQuote(), getRandomQuote()]);
  }, []); // customQuotes가 변경되어도 현재 보이는 리스트는 유지하거나, 원하면 초기화 로직 추가 가능

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
        <HeaderLeft></HeaderLeft>
        <Box
          position={"absolute"}
          top={0}
          right={0}
          m="s"
          p="xs"
          minHeight={44}
          width={100}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexDirection={"row"}
          zIndex={10}
        >
          <Pressable onPress={() => refThemePicker.current?.open()}>
            <Box
              borderRadius={"hg"}
              borderWidth={1}
              borderColor={"$foreground"}
              width={40}
              height={40}
              justifyContent={"center"}
              flexDirection={"column"}
              alignContent={"center"}
              alignItems={"center"}
            >
              <FeatherIcon name="image" size={22}></FeatherIcon>
            </Box>
          </Pressable>
          <Pressable onPress={() => router.push("/SettingScreen")}>
            <Box
              borderRadius={"hg"}
              borderWidth={1}
              borderColor={"$foreground"}
              width={40}
              height={40}
              justifyContent={"center"}
              flexDirection={"column"}
              alignContent={"center"}
              alignItems={"center"}
            >
              <FeatherIcon name="settings" size={22}></FeatherIcon>
            </Box>
          </Pressable>
        </Box>

        <Box flex={1} justifyContent={"center"} alignItems={"center"}>
          <Swiper
            horizontal={false}
            showsButtons={false}
            showsPagination={false}
            loop={false}
            onIndexChanged={(index) => {
              if (index >= quotes.length - 2) {
                setQuotes((prev) => [...prev, getRandomQuote()]);
              }
            }}
          >
            {quotes.map((quote, idx) => (
              <QuoteItem key={`${quote.id}-${idx}`} {...quote} />
            ))}
          </Swiper>
        </Box>
      </Box>
      {!isAdFree && (
        <Box
          alignItems="center"
          justifyContent="center"
          width={width}
          position={isAdLoaded ? "relative" : "absolute"}
          opacity={isAdLoaded ? 1 : 0}
          pointerEvents={isAdLoaded ? "auto" : "none"}
        >
          <BannerAd
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            unitId={TestIds.BANNER}
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
    </SafeAreaView>
  );
}

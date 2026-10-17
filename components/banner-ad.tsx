import { Box } from "@/atom";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { BannerAd as GoogleBannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// 개발 환경에서는 테스트 광고 ID를 사용한다.
const BANNER_UNIT_ID = __DEV__ ? TestIds.BANNER : "ca-app-pub-3739053005473702/4339756170";

/**
 * 화면 하단 AdMob 배너.
 * 광고 로드가 끝나기 전까지는 투명하게 두어 레이아웃 깜빡임을 막는다.
 */
const BannerAd: React.FC = () => {
  const { width } = useWindowDimensions();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Box
      alignItems="center"
      justifyContent="center"
      width={width}
      minHeight={60}
      opacity={isLoaded ? 1 : 0}
      pointerEvents={isLoaded ? "auto" : "none"}
    >
      <GoogleBannerAd
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        unitId={BANNER_UNIT_ID}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setIsLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.log("Ad failed to load: ", error);
          setIsLoaded(false);
        }}
      />
    </Box>
  );
};

export default BannerAd;

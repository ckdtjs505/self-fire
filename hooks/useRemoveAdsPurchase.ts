import { useAdStore } from "@/store/ad-store";
import { useEffect } from "react";
import { useIAP } from "react-native-iap";
import Toast from "react-native-toast-message";

const SKU_REMOVE_ADS = "remove_ads_990";

const showPurchaseError = () =>
  Toast.show({ type: "error", text1: "오류", text2: "결제를 진행하는 중 문제가 발생했습니다." });

/**
 * '광고 제거' 인앱 결제.
 * 결제가 완료되면 광고 제거 상태를 저장한다.
 */
export const useRemoveAdsPurchase = () => {
  const { isAdFree, setAdFree } = useAdStore();

  const { connected, finishTransaction, fetchProducts, requestPurchase } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
        setAdFree(true);
        Toast.show({ type: "success", text1: "완료", text2: "광고 제거 기능이 활성화되었습니다." });
      } catch (error) {
        console.error("Failed to finish transaction", error);
      }
    },
    onPurchaseError: (error) => {
      console.error("Purchase error", error);
      showPurchaseError();
    },
  });

  // 스토어 연결 후 상품 정보를 미리 불러온다.
  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [SKU_REMOVE_ADS], type: "in-app" }).catch(console.error);
    }
  }, [connected, fetchProducts]);

  const purchaseRemoveAds = async () => {
    if (isAdFree) {
      Toast.show({ type: "info", text1: "알림", text2: "이미 광고 제거 기능이 활성화되어 있습니다." });
      return;
    }

    try {
      await requestPurchase({
        type: "in-app",
        request: {
          apple: { sku: SKU_REMOVE_ADS },
          google: { skus: [SKU_REMOVE_ADS] },
        },
      });
    } catch (err: any) {
      console.error(err.code, err.message);
      showPurchaseError();
    }
  };

  return { isAdFree, purchaseRemoveAds };
};

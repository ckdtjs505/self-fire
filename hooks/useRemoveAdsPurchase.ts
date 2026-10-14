import { useAdStore } from "@/store/ad-store";
import { useEffect, useRef } from "react";
import { ErrorCode, Purchase, useIAP } from "react-native-iap";
import Toast from "react-native-toast-message";

const SKU_REMOVE_ADS = "remove_ads_990";
// 스토어에서 상품 정보를 아직 못 받았을 때 보여줄 가격
const FALLBACK_PRICE = "₩990";

const showPurchaseError = () =>
  Toast.show({ type: "error", text1: "오류", text2: "결제를 진행하는 중 문제가 발생했습니다." });

const isRemoveAdsPurchase = (purchase: Purchase) =>
  purchase.productId === SKU_REMOVE_ADS && purchase.purchaseState === "purchased";

/**
 * '광고 제거' 인앱 결제.
 * - 결제가 완료되면 광고 제거 상태를 저장한다.
 * - 스토어 연결 시 이전 구매 내역을 확인해 자동으로 복원한다. (재설치·기기 변경 대응)
 */
export const useRemoveAdsPurchase = () => {
  const { isAdFree, setAdFree } = useAdStore();
  // 사용자가 직접 '구매 복원'을 눌렀을 때만 결과 토스트를 띄운다.
  const isManualRestore = useRef(false);

  const {
    connected,
    products,
    availablePurchases,
    finishTransaction,
    fetchProducts,
    getAvailablePurchases,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      // 결제 대기(pending) 상태에서는 아직 광고를 제거하지 않는다.
      if (!isRemoveAdsPurchase(purchase)) return;
      try {
        await finishTransaction({ purchase, isConsumable: false });
        setAdFree(true);
        Toast.show({ type: "success", text1: "완료", text2: "광고 제거 기능이 활성화되었습니다." });
      } catch (error) {
        console.error("Failed to finish transaction", error);
      }
    },
    onPurchaseError: (error) => {
      if (error.code === ErrorCode.UserCancelled) return;
      // 이미 구매한 상품이면 구매 내역에서 복원한다.
      if (error.code === ErrorCode.AlreadyOwned) {
        isManualRestore.current = true;
        getAvailablePurchases().catch(console.error);
        return;
      }
      console.error("Purchase error", error);
      showPurchaseError();
    },
  });

  // 스토어 연결 후 상품 정보와 이전 구매 내역을 불러온다.
  useEffect(() => {
    if (!connected) return;
    fetchProducts({ skus: [SKU_REMOVE_ADS], type: "in-app" }).catch(console.error);
    getAvailablePurchases().catch(console.error);
  }, [connected, fetchProducts, getAvailablePurchases]);

  // 구매 내역에 광고 제거가 있으면 활성화한다. 승인(acknowledge)되지 않은 구매는 마무리한다.
  useEffect(() => {
    const purchase = availablePurchases.find(isRemoveAdsPurchase);
    const wasManual = isManualRestore.current;
    isManualRestore.current = false;

    if (!purchase) {
      if (wasManual) Toast.show({ type: "info", text1: "알림", text2: "복원할 구매 내역이 없습니다." });
      return;
    }
    if ("isAcknowledgedAndroid" in purchase && purchase.isAcknowledgedAndroid === false) {
      finishTransaction({ purchase, isConsumable: false }).catch(console.error);
    }
    setAdFree(true);
    if (wasManual) Toast.show({ type: "success", text1: "완료", text2: "광고 제거 구매가 복원되었습니다." });
  }, [availablePurchases, finishTransaction, setAdFree]);

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

  const restorePurchases = async () => {
    if (!connected) {
      showPurchaseError();
      return;
    }
    isManualRestore.current = true;
    try {
      await getAvailablePurchases();
    } catch (e) {
      isManualRestore.current = false;
      console.error(e);
      showPurchaseError();
    }
  };

  const price = products.find((p) => p.id === SKU_REMOVE_ADS)?.displayPrice ?? FALLBACK_PRICE;

  return { isAdFree, price, purchaseRemoveAds, restorePurchases };
};

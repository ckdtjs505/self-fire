import { Box, SafeAreaView, Text } from "@/atom";
import { useEffect, useState } from "react";
import * as Application from "expo-application";
import SettingItem from "@/components/setting-item";
import { Linking } from "react-native";
export default function SettingScreen() {
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    setAppVersion(Application.nativeBuildVersion || "");
  }, []);

  return (
    <SafeAreaView flex={1}>
      <Box backgroundColor={"$background"} flex={1} padding="md">
        <Text margin="s" fontSize={18} fontWeight="bold">
          설정
        </Text>

        <Box margin={"md"}>
          <Text marginBottom="s">일반</Text>

          <Box bg={"$sidebarBackground"} borderRadius={"md"} padding={"md"}>
            <SettingItem
              icon={"help-circle"}
              title="자주 묻는 질문"
              handleClickItem={() => {
                Linking.openURL("https://workshop-code.tistory.com/107");
              }}
            ></SettingItem>
            <SettingItem
              icon={"shopping-cart"}
              title="광고 제거"
              handleClickItem={() => {
                console.log("click");
              }}
            ></SettingItem>
            <SettingItem
              icon={"star"}
              title="응원의 리뷰 쓰기"
              handleClickItem={() => {
                console.log("click");
              }}
            ></SettingItem>
          </Box>
        </Box>

        <Box marginTop="xs">
          <Text marginBottom="s">앱 정보</Text>
          <Text>버전: {appVersion}</Text>
        </Box>
      </Box>
    </SafeAreaView>
  );
}

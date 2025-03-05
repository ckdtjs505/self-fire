import { Box, SafeAreaView } from "@/atom";
import HeaderLeft from "@/components/header-left";
import FeatherIcon from "@/components/icon";
import QuoteItem from "@/components/quote-items";
import ThemePicker from "@/components/theme-picker";
import { getQuote } from "@/data/quotes";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable } from "react-native";
import Swiper from "react-native-swiper";

export default function Index() {
  const refThemePicker = useRef(null);

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
            onIndexChanged={() => {}}
          >
            <QuoteItem {...getQuote()}></QuoteItem>
            <QuoteItem {...getQuote()}></QuoteItem>
          </Swiper>
        </Box>
      </Box>
      <ThemePicker ref={refThemePicker} />
    </SafeAreaView>
  );
}

import { Box, Text } from "@/atom";
import { quotes } from "@/data/quotes";
import { Alert } from "react-native";
import { Pressable } from "react-native-gesture-handler";
type Props = {};
const Sidebar: React.FC<Props> = () => {
  return (
    <Box
      flex={1}
      backgroundColor={"$sidebarBackground"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Box>
        <Text fontSize={24} color={"$sidebarForeground"}>
          SELF FIRE
        </Text>
        <Text fontSize={18} color={"$sidebarForeground"}>
          나를 타오르게 하는 문장들
        </Text>
      </Box>

      <Box margin={"md"}>
        {quotes.splice(10).map(({ text }, idx) => {
          return (
            <Pressable
              key={idx}
              onPress={() => {
                Alert.alert("삭제하시겠습니까?", "다시 되돌릴 수 없습니다,", [
                  {
                    text: "삭제",
                    onPress: () => {
                      console.log("delete");
                    },
                  },
                  { text: "취소" },
                ]);
              }}
            >
              <Text
                fontSize={16}
                marginTop={"s"}
                key={idx}
                color={"$sidebarForeground"}
              >
                {text}
              </Text>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
};

export default Sidebar;

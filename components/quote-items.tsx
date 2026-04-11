import { Box, Text } from "@/atom";
import Quotebar from "./quote-bar";
import FeatherIcon from "./icon";

type Props = {
  text: string;
  author: string;
  id: string;
  isCustom?: boolean;
};

const QuoteItem: React.FC<Props> = ({ text, author, id, isCustom }) => {
  return (
    <Box flex={1} justifyContent={"center"} alignItems={"center"} margin={"lg"}>
      {isCustom && (
        <Box
          bg="$primary"
          px="md"
          py="xs"
          borderRadius="md"
          marginBottom="md"
          flexDirection="row"
          alignItems="center"
        >
          <FeatherIcon name="edit-2" size={14} color="white" />
          <Text color="white" fontSize={12} fontWeight="bold" marginLeft="xs">
            나만의 명언
          </Text>
        </Box>
      )}
      <Box margin={"md"}>
        <Text
          fontSize={28}
          fontWeight={"heavy"}
          textAlign={"center"}
          lineHeight={40}
        >
          {text}
        </Text>
      </Box>
      <Text> - {author} - </Text>
      <Quotebar id={id} text={text} author={author}></Quotebar>
    </Box>
  );
};

export default QuoteItem;

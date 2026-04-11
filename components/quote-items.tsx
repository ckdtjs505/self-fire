import { Box, Text } from "@/atom";
import Quotebar from "./quote-bar";
type Props = {
  text: string;
  author: string;
  id: string;
};

const QuoteItem: React.FC<Props> = ({ text, author, id }) => {
  return (
    <Box flex={1} justifyContent={"center"} alignItems={"center"} margin={"lg"}>
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

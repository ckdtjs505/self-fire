import { Box, Text } from "@/atom";
import Quotebar from "./quote-bar";
const getChunckQuote = (text: string) => {
  const chunckQuote: string[] = [];
  const splitQuote = text.split(" ");
  for (let i = 0; i < splitQuote.length; i += 3) {
    const temp = splitQuote.slice(i, i + 3).join(" ");
    chunckQuote.push(temp);
  }

  return chunckQuote;
};
type Props = {
  text: string;
  author: string;
  id: string;
};
const QuoteItem: React.FC<Props> = ({ text, author, id }) => {
  const quotesTexts = getChunckQuote(text);

  return (
    <Box flex={1} justifyContent={"center"} alignItems={"center"} margin={"lg"}>
      <Box margin={"md"}>
        {quotesTexts.map((val, idx) => {
          return (
            <Text
              key={idx}
              fontSize={28}
              fontWeight={"heavy"}
              textAlign={"center"}
            >
              {val}
            </Text>
          );
        })}
      </Box>
      <Text> - {author} - </Text>
      <Quotebar id={id} text={text} author={author}></Quotebar>
    </Box>
  );
};

export default QuoteItem;

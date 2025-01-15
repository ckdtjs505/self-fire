import { Box, Text } from "@/atom";
import { getQuote } from "@/data/quotes";
import Quotebar from "./quote-bar";
const quote = getQuote();
const getChunckQuote = (text: string) => {
  const chunckQuote: string[] = [];
  const splitQuote = text.split(" ");
  for (let i = 0; i < splitQuote.length; i += 3) {
    const temp = splitQuote.slice(i, i + 3).join(" ");
    chunckQuote.push(temp);
  }

  return chunckQuote;
};

const QuoteItem = ({ text, author }) => {
  const quotesTexts = getChunckQuote(text);

  return (
    <Box flex={1} justifyContent={"center"} alignItems={"center"} margin={"lg"}>
      <Box margin={"lg"}>
        {quotesTexts.map((val, idx) => {
          return (
            <Text
              key={idx}
              fontSize={30}
              fontWeight={"heavy"}
              textAlign={"center"}
              color={"black"}
            >
              {val}
            </Text>
          );
        })}
      </Box>
      <Text> - {author} - </Text>
      <Quotebar></Quotebar>
    </Box>
  );
};

export default QuoteItem;

import { Box, Text } from "@/atom";
import { getQuote } from "@/data/quotes";

const quote = getQuote();
const chunckQuote: string[] = [];
const splitQuote = quote.text.split(" ");
for (let i = 0; i < splitQuote.length; i += 3) {
  const temp = splitQuote.slice(i, i + 3).join(" ");
  chunckQuote.push(temp);
}

const QuoteItem = () => {
  return (
    <Box alignItems={"center"} width={"80%"} height={200} margin={"lg"}>
      <Box margin={"lg"}>
        {chunckQuote.map((val) => {
          return (
            <Text
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
      <Text> - {quote.author} - </Text>
    </Box>
  );
};

export default QuoteItem;

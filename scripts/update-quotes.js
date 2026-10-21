// 서버에서 전체 명언을 받아 data/quotes.json을 생성한다.
// quotes.json은 저장소에 올리지 않으므로(.gitignore) 빌드 전에 실행해야 한다.
//   npm run update-quotes
const fs = require("fs");
const path = require("path");
const { cleanQuotes } = require("../data/quote-cleaner");

const API_URL = process.env.QUOTES_API_URL || "https://ckdtjst505.mycafe24.com/api/quote/get_all.php";
const OUT = path.join(__dirname, "..", "data", "quotes.json");

(async () => {
  const res = await fetch(API_URL);
  const json = await res.json();
  if (json.status !== "success" || !Array.isArray(json.data)) {
    throw new Error("Unexpected API response");
  }

  const seen = new Set();
  const raw = json.data
    .map((item) => ({
      id: String(Number(item.id)),
      text: String(item.text ?? "").trim(),
      author: String(item.author ?? "").trim(),
      featured: item.featured,
      categories: item.categories,
    }))
    .filter((q) => q.text && !seen.has(q.id) && seen.add(q.id))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const quotes = cleanQuotes(raw);

  fs.writeFileSync(OUT, JSON.stringify(quotes));
  const featured = quotes.filter((q) => q.featured).length;
  console.log(
    `Wrote ${quotes.length} quotes (${raw.length - quotes.length} filtered, ${featured} featured) to ${path.relative(process.cwd(), OUT)}`
  );
  if (featured === 0) console.warn("No featured quotes: daily quote falls back to all quotes.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

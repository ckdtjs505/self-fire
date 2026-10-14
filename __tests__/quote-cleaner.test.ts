import { cleanQuote, cleanQuotes } from "@/data/quote-cleaner";

const q = (text: string, author = "괴테", id = "1") => ({ id, text, author });

describe("cleanQuote", () => {
  it("HTML 엔티티를 복원한다", () => {
    expect(cleanQuote(q("인생에 &#039;실패&#039;란 없다."))?.text).toBe("인생에 '실패'란 없다.");
  });

  it("여러 번역·한자 원문이 붙어 있으면 첫 문장만 남긴다", () => {
    expect(cleanQuote(q("관대하면 대중을 얻는다.\n寬卽得衆 (관즉득중)"))?.text).toBe("관대하면 대중을 얻는다.");
  });

  it("한자 병기를 지운다", () => {
    expect(cleanQuote(q("효(孝)는 백행(百行)의 근본이다."))?.text).toBe("효는 백행의 근본이다.");
  });

  it("본문에 섞인 작가를 분리한다", () => {
    expect(cleanQuote(q("큰 나무는 바람을 많이 받는다.\n- 카네기", ""))).toEqual(
      q("큰 나무는 바람을 많이 받는다.", "카네기")
    );
    expect(cleanQuote(q("마음은 따뜻하게 행동은 씩씩하게. - 황경신", ""))).toEqual(
      q("마음은 따뜻하게 행동은 씩씩하게.", "황경신")
    );
  });

  it("작가 표기를 통일하고 빈 작가는 작자 미상으로 둔다", () => {
    expect(cleanQuote(q("평화란 고요함 속에 누리는 자유이다.", "시세로"))?.author).toBe("키케로");
    expect(cleanQuote(q("뭐든 할 수 있지만 모든 걸 할 수는 없다.", ""))?.author).toBe("작자 미상");
  });

  it("명언으로 부적절한 항목은 뺀다", () => {
    expect(cleanQuote(q("대중들은 큰 거짓말에 쉽게 속는다.", "아돌프 히틀러"))).toBeNull();
    expect(cleanQuote(q("고생끝에 골병난다.", "박명수"))).toBeNull();
    expect(cleanQuote(q("여자는 잠자코 있을 때에도 거짓말을 한다.", "이스라엘 속담"))).toBeNull();
    expect(cleanQuote(q("말!"))).toBeNull();
  });
});

describe("cleanQuotes", () => {
  it("띄어쓰기·문장부호만 다른 중복은 먼저 나온 것만 남긴다", () => {
    const list = [q("남자는 마음으로 늙는다.", "a", "1"), q("남자는 마음으로  늙는다", "b", "2")];
    expect(cleanQuotes(list).map((x) => x.id)).toEqual(["1"]);
  });

  it("이미 가진 명언과 같은 문장은 뺀다", () => {
    expect(cleanQuotes([q("시작이 반이다.")], ["시작이 반이다"])).toEqual([]);
  });
});

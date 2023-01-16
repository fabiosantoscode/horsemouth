import { algorithmTokenizer } from "./tokenizer";

expect.addSnapshotSerializer({
  test: (val) => val === algorithmTokenizer,
  print: (val) => {
    const tokens = [...(val as typeof algorithmTokenizer)];
    return `${tokens.map((t) => `${t.type}(${t.value})`).join(" ")}`;
  },
});

it("detects parentheticals that are calls", () => {
  expect(algorithmTokenizer.reset("(1 + 2)")).toMatchInlineSnapshot(
    `lParen(() number(1) math(+) number(2) rParen())`
  );

  expect(algorithmTokenizer.reset("fn(1 + 2)")).toMatchInlineSnapshot(
    `word(fn) lParenCall(() number(1) math(+) number(2) rParen())`
  );
  expect(algorithmTokenizer.reset("fn (1 + 2)")).toMatchInlineSnapshot(
    `word(fn) lParenCall(() number(1) math(+) number(2) rParen())`
  );

  expect(
    algorithmTokenizer.reset("obj . [[ GetOwnProperty ]] ( key )")
  ).toMatchInlineSnapshot(
    `word(obj) dot(.) lSlotBrackets([[) word(GetOwnProperty) rSlotBrackets(]]) lParenCall(() word(key) rParen())`
  );
});

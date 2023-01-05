import moo from "moo";
import type { HorsemouthLexer } from "./tokenizerMooOverride";

const tokens = {
  word: {
    match: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
  } as moo.Rule,
  space: {
    match: /[ \n\xa0]+/,
    lineBreaks: true,
  },
  comma: ",",
  dot: ".",
  questionMark: /\?/,
  percentReference: /"%[^%]+%"/,
  string: /"[^"]+"/,
  number: /\d+/,
  lParen: "(",
  rParen: ")",
  lSlotBrackets: "[[",
  rSlotBrackets: "]]",
  lSquareBracket: "[",
  rSquareBracket: "]",
  lList: "«",
  rList: "»",
  innerBlockHack: {
    match: /:::innerblockhack\d+/,
    value: (s: string) => s.replace(":::innerblockhack", ""),
  } as moo.Rule,
};

export const getInnerBlockHack = (num: number) => `:::innerblockhack${num}`;

export type TokenType = keyof typeof tokens;
export type TokenOfType<T extends TokenType> = moo.Token & { type: T };
export const algorithmTokenizer = moo.compile(tokens) as HorsemouthLexer;
const _next = algorithmTokenizer.next;
algorithmTokenizer.next = () => {
  const token = _next.call(algorithmTokenizer);
  if (token?.type === "space") return algorithmTokenizer.next();
  return token;
};

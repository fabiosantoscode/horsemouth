import moo from "moo";
import type { HorsemouthLexer } from "./tokenizerMooOverride";
import { noSpaceTokenizer } from "../parser-tools/noSpaceTokenizer";

const tokens = {
  word: {
    match: /[a-zA-Z_$ℤ𝔽ℝ][a-zA-Z0-9_$ℤ𝔽ℝ]*/u,
  } as moo.Rule,
  space: {
    match: /[ \n\xa0]+/u,
    lineBreaks: true,
  },
  /** How we're able to nest blocks in our parser.
   * We replace inner blocks with a fake token, that gets parsed as a fake AST node,
   * and then replace it with the actual block later.
   */
  innerBlockHack: {
    match: /:::innerblockhack\d+/u,
    value: (s: string) => s.replace(":::innerblockhack", ""),
  } as moo.Rule,
  comma: ",",
  dot: ".",
  colon: ":",
  questionMark: /\?/u,
  exclamationMark: "!",
  percentReference: /"?%[^%]+%"?/u,
  wellKnownSymbol: /@@[a-z]+/u,
  string: /"[^"]*"/u,
  hexNumber: {
    match: /0x[0-9a-fA-F]+/u,
    value: (s: string) => String(parseInt(s, 16)),
  },
  number: /\d+(?:\.\d+)?/u,
  lParen: "(",
  rParen: ")",
  comparisonOps: /[<>≤≥≠=]/u,
  lSlotBrackets: "[[",
  rSlotBrackets: "]]",
  lSquareBracket: "[",
  rSquareBracket: "]",
  lBrace: "{",
  rBrace: "}",
  lList: "«",
  rList: "»",
  semicolon: ";",
  math: /[+/*\-∞–×]/u,
  error: moo.error,
};

export const getInnerBlockHack = (num: number) => `:::innerblockhack${num}`;

export type TokenType = (keyof typeof tokens) | 'lParenCall';
export type TokenOfType<T extends TokenType> = moo.Token & { type: T };

export const algorithmTokenizer = noSpaceTokenizer(
  moo.compile(tokens),
  (token, prevToken) => {

    // Is this an open paren that's a function call?
    if (
      token?.type === 'lParen'
      && (
        ['rSlotBrackets', 'rSquareBracket', 'percentReference'].includes(prevToken?.type ?? '')
      || (prevToken?.type === 'word' && !isReservedWord(prevToken.value)))
    ) {
      token.type = 'lParenCall'
    }

    return token
  }
) as HorsemouthLexer;

const reservedWords = new Set(`
  if then else let be is the of
  and or not exception return throw modulo
  otherwise either while
`.split(/\n/g).join(' ').split(/\s+/g))

const isReservedWord = (word: string) => reservedWords.has(word);

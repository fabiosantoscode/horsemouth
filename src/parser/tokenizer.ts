import { HTMLElement } from "linkedom";
import moo from "moo";
import { flattenSupertokens } from "../parse-tools/flattenSupertokens";
import { GenericToken, tokenizeNodes } from "../parse-tools/tokenizeNodes";

export const algorithmTokenizer = moo.compile({
  word: { match: /[a-zA-Z_$][a-zA-Z0-9_$]*/ },
  space: /[ \xa0]+/,
  comma: ',',
  dot: '.',
  questionMark: '?',
  lParen: '(',
  rParen: ')',
  lSlotBrackets: '[[',
  rSlotBrackets: ']]',
  lSquareBracket: '[',
  rSquareBracket: ']',
  lList: '«',
  rList: '»',
})

let enhancedTokens: GenericToken[] = []
export const algorithmEnhancedTokenizer: moo.Lexer = Object.assign(Object.create(algorithmTokenizer), {
  reset(chunk?: string | HTMLElement[]) {
    if (typeof chunk === 'string' || !chunk) {
      throw new Error('not implemented')
    }

    enhancedTokens = flattenSupertokens(tokenizeNodes({
      nodes: chunk,
      tokenizer: algorithmTokenizer,
    }))

    return this
  },
  next() {
    const token = enhancedTokens.shift()

    if (!token) {
      return null
    }

    return {
      ...token,
      value: token.value.toLowerCase(),
      text: (token.text ?? token.value).toLowerCase()
    }
  }
})

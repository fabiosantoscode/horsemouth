import assert from "assert"
import { HTMLElement, HTMLLIElement, Text } from "linkedom"

export type TokenType =
  | 'word'
  | 'identifier'
  | 'slot-identifier'
  | 'function-name'
  | 'value'
  | 'space'
  | 'comma'
  | 'dot'
  | 'lParen'
  | 'rParen'
  | 'lBrace'
  | 'rBrace'
  | 'lList'
  | 'rList'
  | 'lSlotBrackets'
  | 'rSlotBrackets'
  | 'lSquareBracket'
  | 'rSquareBracket'
  | 'questionMark'
  // Splitting statements and do-expressions
  | 'lDo'
  | 'rDo'
  | 'endStatement'

export interface BasicToken {
  type: TokenType
  value: string
}

export interface SuperToken { type: 'supertoken', value: GenericToken[][] }

export type GenericToken = BasicToken | SuperToken

export type TokenOfType<T> =
  T extends TokenType
  ? BasicToken & { type: T }
  : T extends 'supertoken'
  ? SuperToken
  : GenericToken

// TODO use this to compact slots and other token types
// Or maybe not, I'm not your dad
function compactTokens(tokens: GenericToken[]) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'lSlotBrackets') {
      // compact [[SlotName]] into one tok
      if (
        tokens[i + 1]?.type === 'word'
        && tokens[i + 2]?.type === 'rSlotBrackets'
      ) {
        tokens[i] = { type: 'slot-identifier', value: tokens[i + 1].value } as BasicToken
        tokens.splice(i + 1, 2)
        i -= 2
        continue
      } else {
        throw new Error('compaction error. Saw a "[" and didnt see rest of "[[SlotName]]"')
      }
    }

    if (
      tokens[i].value.toLowerCase?.() === 'the'
      && tokens[i + 1]?.type === 'value' && tokens[i + 1]?.value === 'this'
      && tokens[i + 2]?.type === 'word' && tokens[i + 2]?.value === 'value'
    ) {
      tokens[i] = { type: 'value', value: 'this' }
      tokens.splice(i + 1, 2)
      i -= 2
      continue
    }

    // TODO: Dunno what this ? Fcall(...args) notation is for, skip for now
    if (tokens[i].type === 'questionMark') {
      tokens.splice(i, 1)
      i--
      continue
    }

    if (tokens[i].type === 'identifier' && tokens[i + 1]?.type === 'lParen') {
      // Function start token
    }
  }

  return tokens
}

export function tokenizeNodes({ tokenizer, nodes }: {
  tokenizer: moo.Lexer,
  nodes: HTMLElement[],
}): GenericToken[] {
  const tokenizeTextOrElement = (node: HTMLElement): GenericToken | GenericToken[] => {
    if (node instanceof Text) {
      const tokens = [...tokenizer.reset(((node as any).textContent))].filter(token => token.type !== 'space').map(({ type, value }) => ({ type, value }) as GenericToken)
      if (tokens[tokens.length - 1]?.type === 'dot') {
        tokens.pop()
      }
      return (tokens)
    }

    switch (node.nodeName) {
      case 'VAR': return { type: 'identifier', value: node.textContent } as BasicToken
      case 'EMU-VAL': return { type: 'value', value: node.textContent } as BasicToken
      case 'EMU-XREF': {
        if (node.getAttribute('aoid')) {
          return { type: 'function-name', value: node.getAttribute('aoid') } as BasicToken
        }

        return { type: 'identifier', value: node.textContent } as BasicToken
      }
      case 'EMU-CONST': return { type: 'value', value: node.textContent } as BasicToken

      case 'OL': {
        const childTokenLists = [...node.childNodes].map((liNode: HTMLLIElement) => {
          assert(liNode.tagName === 'LI')
          return compactTokens([...liNode.childNodes].flatMap(tokenizeTextOrElement))
        })

        return { type: 'supertoken', value: childTokenLists } as GenericToken
      }
      case 'LI': {
        return compactTokens([...node.childNodes].flatMap(tokenizeTextOrElement))
      }
    }
    throw new Error('cannot tokenize node ' + node.outerHTML ?? node.textContent ?? node)
  }

  const tokens = [...nodes].flatMap(tokenizeTextOrElement)

  return compactTokens(tokens)
    .flatMap(emptify)
    .map(tok => {
      return Object.defineProperty(
        tok,
        'text',
        { enumerable: false, value: tok.value }
      )
    })
}

const emptify = (token: GenericToken) => {
  if (
    token.type === 'supertoken'
    && (token.value.length === 0 || token.value.every(item => item.length === 0))
  ) {
    return []
  }
  return [token]
}

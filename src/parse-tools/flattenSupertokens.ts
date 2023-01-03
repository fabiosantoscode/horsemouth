import { GenericToken } from "./tokenizeNodes"

const last = <T>(arr: T[]): T | undefined => arr[arr.length - 1]

export const flattenSupertokens = (tokens: GenericToken[]): GenericToken[] => {
  tokens = (function flattenInner(tokens): GenericToken[] {
    return  tokens.flatMap(token => {
      if (token.type === 'supertoken') {
        return [
          { type: 'lDo', value: '' },
          ...(token.value).flatMap((statement):GenericToken[] => {
            return [
              ...flattenInner(statement),
              { type: 'endStatement', value: ';' },
            ]
          }),
          { type: 'rDo', value: '' }
        ]
      }
      return [token]
    })
  })(tokens)

  if (last(tokens) && last(tokens)?.type !== 'endStatement') {
    return [...tokens, { type: 'endStatement', value: ';' }]
  } else{
    return tokens
  }
}

import moo from 'moo'

type TokenizerFilter = (token: moo.Token, prevToken?: moo.Token) => (moo.Token|undefined);

export function filteredTokenizer(tokenizer: moo.Lexer, filters: TokenizerFilter[]) {
  let prevToken : moo.Token | undefined;
  filters = [
    ...filters,
    (t) => {
      prevToken = t
      return t;
    }
  ]

  const filter = (token?: moo.Token) => {
    return filters.reduce((t, f) => t == null ? t : f(t, prevToken), token);
  }

  const plainNext = tokenizer.next;
  tokenizer.next = () => {
    const token = plainNext.call(tokenizer);

    if (token != null) {
      return filter(token) ?? tokenizer.next();
    } else {
      return token;
    }
  };
  return tokenizer;
}

export function noSpaceTokenizer(tokenizer: moo.Lexer, ...filters: TokenizerFilter[]) {
  return filteredTokenizer(tokenizer, [filterSpaceTokens, ...filters]);
}

export function filterSpaceTokens(token: moo.Token) {
  if (token.type === 'space') {
    return undefined;
  }
  return token;
}

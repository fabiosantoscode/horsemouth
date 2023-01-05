
export function noSpaceTokenizer(tokenizer: moo.Lexer) {
  const plainNext = tokenizer.next;
  tokenizer.next = () => {
    const token = plainNext.call(tokenizer);
    if (token?.type === "space"){
      return tokenizer.next();}
    return token;
  };
  return tokenizer
}

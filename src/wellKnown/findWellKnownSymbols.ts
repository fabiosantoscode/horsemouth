const symbolsCache = new Map();

export const findWellKnownSymbols = (doc: Element | Document): string[] => {
  if (symbolsCache.has(doc)) {
    return symbolsCache.get(doc);
  }

  const sec = doc.querySelector("#sec-well-known-symbols");

  if (!sec?.textContent) {
    throw new Error("Well known symbols not found at #sec-well-known-symbols");
  }

  const ret = [...sec.textContent.matchAll(/@@[a-z0-9]+/gi)].map(
    ([symbol]) => symbol
  );

  if (!ret.length) {
    throw new Error("Well known symbols not found at #sec-well-known-symbols");
  }

  symbolsCache.set(doc, ret);

  wellKnownSymbols = new Set(ret);

  return ret;
};

export let wellKnownSymbols = new Set<string>();

const symbolsCache = new Map();

export const findWellKnownIntrinsics = (doc: Element | Document): string[] => {
  if (symbolsCache.has(doc)) {
    return symbolsCache.get(doc);
  }

  const sec = doc.querySelector("#sec-well-known-intrinsic-objects");

  if (!sec?.textContent) {
    throw new Error(
      "Well known intrinsics not found at #sec-well-known-intrinsic-objects"
    );
  }

  const ret = [...sec.textContent.matchAll(/%[a-z0-9]+%/gi)].map(
    ([symbol]) => symbol
  );

  if (!ret.length) {
    throw new Error(
      "Well known symbols not found at #sec-well-known-intrinsic-objects"
    );
  }

  symbolsCache.set(doc, ret);

  wellKnownIntrinsics = new Set(ret);

  return ret;
};

export let wellKnownIntrinsics = new Set<string>();


const symbolsCache = new Map()

export const findWellKnownSymbols=(doc: Element | Document): string[] => {
  if (symbolsCache.has(doc)) {
    return symbolsCache.get(doc)
  }

  const sec = doc.querySelector('#sec-well-known-symbols')

  if (!sec?.textContent) {
    throw new Error('Well known symbols not found')
  }

  const ret = [...sec.textContent.matchAll(/@@[a-z]+/gi)].map(([symbol]) => symbol)

  symbolsCache.set(doc, ret)

  wellKnownSymbols = new Set(ret)

  return ret
}

export let wellKnownSymbols = new Set<string>()

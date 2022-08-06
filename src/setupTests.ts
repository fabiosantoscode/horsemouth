
expect.addSnapshotSerializer({
  test: (val) => val && typeof val.ast === 'string' && Array.isArray(val.children),
  print: (val, serialize) => {
    if (val.ast === 'literal') {
      return `lit ${(val.children[0])}`
    }
    if (val.ast === 'reference') {
      return "" + val.children[0]
    }
    if (val.ast === 'slot') {
      return `[[${(val.children[0])}]]`
    }
    return `(${val.ast} ${serialize(val.children)})`
  }
})

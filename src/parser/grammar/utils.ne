
@{%
const n = (ostensiblyNode, context = '') => {
  if (typeof ostensiblyNode === 'function') {
    return (...args) => n(ostentiallyNode(...args), context)
  }

  if (!ostensiblyNode) throw new Error('no node at ' + context)
  if (typeof ostensiblyNode.ast !== 'string') {
    throw new Error('not a node at ' + context + " " + JSON.stringify(ostensiblyNode))
  }
  return ostensiblyNode
}

const boolNot = (ostensiblyNode) => n({
  ast: 'unaryExpr',
  children: ['not', n(ostensiblyNode)]
})

const compare = (root, second, ...others) => {
  if (others.length === 0) {
    return n({
      ast: 'binaryExpr',
      children: ['equals', n(root), n(second)]
    })
  }
  return n({
    ast: 'binaryExpr',
    children: ['or', n(compare(root, second)), n(compare(root, ...others))]
  })
}

%}


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

%}

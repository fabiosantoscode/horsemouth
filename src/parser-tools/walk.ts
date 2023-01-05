import {AlgorithmNode} from '../parser/parse';


export const walk = (
  node: AlgorithmNode | AlgorithmNode[],
  fn: (node: AlgorithmNode) => void,
) => {
  if (Array.isArray(node)) {
     node.forEach(node => walk(node, fn))
    return
  } else if (!node || typeof node !== 'object') {
    return
  }
  if (Array.isArray(node.children)) walk(node.children,fn)
  fn(node)
}

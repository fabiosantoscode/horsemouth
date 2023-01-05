import prettier from 'prettier'
import { walk } from '../parser-tools/walk'
import { AlgorithmNode, getNodeSource } from "../parser/parse"

export function stringifyToJs(
  algorithms: { algName: string; algorithm: AlgorithmNode[] }[]
) {
  let slots = new Set()
  for (const {algorithm} of algorithms){
  walk(algorithm, node => {
    if (node.ast === 'slotReference') {
      slots.add(`const ${slotVarName(node.children[0])} = Symbol('slot ${node.children[0]}');`)
    }
    if (node.ast === 'percentReference') {
      slots.add(`const ${percentVarName(node.children[0])} = Symbol('%${node.children[0]}%');`)
    }
  })}

  return [...slots].sort().join('\n') + '\n\n// The good stuff\n\n' + algorithms.map(({algName, algorithm}) => stringifyAlgorithmToJs(algName, algorithm)).join('\n\n')
}

export function stringifyAlgorithmToJs(
  algorithmName: string,
  algorithm: AlgorithmNode[]
) {
  const uglyCode = `
/** ${algorithmName} */
function ${cleanIdentifier(algorithmName)}() {
${algorithm.map(node => "    " + stringifyAlgorithmNode(node)).join("\n")}
}
`
  return prettier.format(uglyCode, { parser: "babel" })
}

// wrapper to add comment wit source text
const stringifyAlgorithmNode = (node: AlgorithmNode) => {
  const source = getNodeSource(node)
  return source
    ? `
/** ${source} */
    ${stringifyAlgorithmNodeRaw(node)}`
    : stringifyAlgorithmNodeRaw(node)
}

function stringifyAlgorithmNodeRaw(node: AlgorithmNode): string {
  const s = stringifyAlgorithmNode
  switch (node.ast) {
    case 'reference': {
      return cleanIdentifier(node.children[0])
    }
    case 'slotReference': {
      return slotVarName(node.children[0])
    }
    case 'percentReference': {
      return percentVarName(node.children[0])
    }
    case 'string': {
      return JSON.stringify(node.children[0])
    }
    case 'number': {
      return node.children[0]
    }
    case 'call': {
      const [fname, ...args] = node.children
      return `${s(fname)}(${args.map(s).join(', ')})`
    }
    case 'list': {
      return `[${node.children.map(s).join(', ')}]`
    }
    case 'typeCheck': {
      const [type, value] = node.children
      return `(/* I'm going to assume this is a ${s(type)} */ ${s(value)})`
    }
    case 'dottedProperty': {
      const [obj, ...props] = node.children
      return `${s(obj)}${props.map(prop => `[${s(prop)}]`).join('')}`
    }
    case 'booleanExpr': {
      const [op, left, right] = node.children
      return `(${s(left)} ${booleanOp(op)} ${s(right)})`
    }
    case 'unaryBooleanExpr': {
      const [op, expr] = node.children
      return `${booleanOp(op)} ${s(expr)}`
    }

    // STAT
    case 'let': {
      return `var ${cleanIdentifier(s(node.children[0]))} = ${s(node.children[1])}`
    }
    case 'set': {
      return `${s(node.children[0])} = ${s(node.children[1])}`
    }
    case 'condition': {
      const [cond, ifTrue, ifFalse] = node.children
      return `if (${s(cond)}) {
        ${s(ifTrue)}
    }${ifFalse ? ` else {
        ${s(ifFalse)}
    }` : ''}`
    }
    case 'forEach': {
      const [item, list, body] = node.children
      return `for (const ${(item)} of ${s(list)}) {
        ${s(body)
      }
    }`
    }
    case 'return_': {
      return `return ${s(node.children[0])};`
    }
    case 'throw_': {
      return `throw ${s(node.children[0])};`
    }
    case 'block': {
      return `{
        ${node.children.map(s).join('\n')}
    }`
    }
    case 'repeat': {
      const [body] = node.children
      return `while (true) {
        ${s(body)}
    }`
    }
    case 'unknown': {
      return "TODO(" + node.children.flatMap(child => {
        if (typeof child === 'string') return JSON.stringify(child)
        if (Array.isArray(child)) return `(() => { ${child.map(s).join('; ')} })()`
        return `(() => { ${s(child)} })()`
      }).join(', ') + ")"
    }
    case 'innerBlockHack': { throw new Error("Shouldn't be here")}
  }
}

const booleanOps = {
  'and': '&&',
  'or': '||',
  'not': '!',
  'equals': '===',
}

const booleanOp = (op: string): string => {
  if (!(op in booleanOps)) throw new Error(`Unknown boolean op ${op}`)
  return (booleanOps as any)[op]
}

const cleanIdentifier = (id: string) => id.replace(/[^a-zA-Z0-9_]+/g, '_')

const slotVarName = (slotName: string) => `slot_${cleanIdentifier(slotName)}`

const percentVarName = (percentName: string) => `percent_${cleanIdentifier(percentName)}`

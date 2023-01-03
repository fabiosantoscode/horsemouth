import assert from "assert"
import { HTMLElement, HTMLLIElement } from "linkedom"
import { inspect } from "util"
import '../experiments'
import { HTMLAlgorithm } from "../html-parsing/findAlgorithms"
import { BasicToken, GenericToken, SuperToken, tokenizeNodes, TokenOfType, TokenType } from "../parse-tools/tokenizeNodes"
import { getOnly } from "../utils/getOnly"
import { algorithmTokenizer } from "./tokenizer"

export type AlgorithmNode =
  | { ast: 'repeat'; children: AlgorithmNode[] }
  | { ast: 'for'; children: [string, AlgorithmNode, AlgorithmNode] }
  | { ast: 'do', children: AlgorithmNode[][]}
  | { ast: 'condition', children: [AlgorithmNode, AlgorithmNode, AlgorithmNode | undefined] }
  | { ast: 'comparison', children: [AlgorithmNode, AlgorithmNode] }
  | { ast: 'negation', children: [AlgorithmNode] }
  | { ast: 'throw', children: [AlgorithmNode] }
  | { ast: 'literal', children: [val: string] }
  | { ast: 'unknown', children: any }
  | { ast: 'reference', children: [string] }
  | { ast: 'call', children: [string, AlgorithmNode[]] }
  | { ast: 'let', children: [string, AlgorithmNode] }
  | { ast: 'list', children: AlgorithmNode[] }
  | { ast: 'slot', children: [string] }
  | { ast: 'or', children: [AlgorithmNode, AlgorithmNode] }
  | { ast: 'and', children: [AlgorithmNode, AlgorithmNode] }
  | { ast: 'setProperty', children: [string, AlgorithmNode, AlgorithmNode] }
  | { ast: 'return', children: [AlgorithmNode] }
  | { ast: 'property-access', children: [AlgorithmNode, AlgorithmNode] }

export type Algorithm = AlgorithmNode[]

// Warning: `tokens` array is mutable
function parseAlgorithmStepTokens(tokens: GenericToken[]): Algorithm{
  const is = (type: TokenType, value?: string) => {
    const t = cur()
    if (t.type === type) {
      return value != null ? t.value.toLocaleLowerCase() === value : true
    }
    return false
  }
  const afterIs = (type: TokenType, value?: string) => {
    if (tokens[1]?.type === type) {
      return value != null ? tokens[1]?.value.toLocaleLowerCase() === value : true
    }
    return false
  }
  const cur = () => tokens[0]
  const next = () => tokens.shift()
  const ended = () => tokens.length === 0

  const expect = <TT extends GenericToken['type']>(type: TT, value?: string): TokenOfType<TT> => {
    const t = cur()
    if (t.type !== type || (value != null && typeof t.value === 'string' && value !== t.value.toLocaleLowerCase())) {
      throw new Error('expected ' + type + ', got ' + t.type)
    }
    return next() as any as TokenOfType<TT>
  }


  const tryConsume = (...things: string[]) => {
    const matchI = (i: number) => {
      if (i >= tokens.length || i >= things.length) { return false }

      if (things[i] === ':' + tokens[i].type) {
        return true
      }

      if (things[i].startsWith('$')) {
        return true
      }
      if (tokens[i].type === 'identifier' && things[i] === ':' + tokens[i].value) {
        return true
      }
      if (things[i].toLowerCase() === tokens[i].value.toLowerCase!() && tokens[i].type === 'word') {
        return true
      }
      return false
    }

    return things.every((_, i) => matchI(i))
  }

  function parseAtom(): AlgorithmNode {
    if (is('word')) {
      return { ast: 'reference', children: [expect('word').value] }
    }
    if (is('identifier')) {
      return { ast: 'reference', children: [expect('identifier').value] }
    }
    if (is('value')) {
      return { ast: 'literal', children: [expect('value').value] }
    }
    if (is('slot-identifier')) {
      return { ast: 'slot', children: [expect('slot-identifier').value] }
    }

    assert(false, 'expected word or literal, got ' + inspect(cur()))
  }

  function parseExpression(): AlgorithmNode {
    function beforeSuffix(): AlgorithmNode {
      // Conditions and loops with multiple items
      // -------
      if (tokens[0].type === 'supertoken') {
        return {ast: 'do', children:  (next() as SuperToken).value.map(line => parseAlgorithmStepTokens([...line]))}
      }

      if (tryConsume('for', 'each', 'element', '$', 'of', '$', ':comma', 'do')) {
        next(); next(); next();
        const boundName = (next() as BasicToken).value
        expect('word', 'of')
        const list = parseAtom()
        expect('comma')
        next()
        const body = parseExpression()
        return { ast: 'for', children: [boundName, list, body]}
      }

      if (tryConsume('repeat', ':comma', ':supertoken')) {
        next()
        next()

        const children = [parseExpression()]
        return { ast: 'repeat', children }
      }

      // "the List/Whatever that is X" => X
      if (tryConsume('the', ':identifier', 'that', 'is')) {
        next(); next(); next(); next()
      }

      // Phrases
      // -------
      if (is('word', 'if')) {
        next()
        const condition = parseExpression()

        if (is('comma')) next()
        if (is('word', 'then')) next()

        const then = parseExpression()

        let elsee: AlgorithmNode | undefined = undefined
        if (!ended()) {
          elsee = parseExpression()
        }
        return { ast: 'condition', children: [condition, then, elsee] }
      }

      if (tryConsume('return', '$')) {
        next()
        return { ast: 'return', children: [parseAtom()] }
      }

      if (tryConsume('let', '$', 'be')) {
        next()
        const name = expect('identifier').value
        expect('word', 'be')
        const value = parseExpression()
        return { ast: 'let', children: [name, value] }
      }

      if (tryConsume('a', 'new', 'empty', ':List')) {
        next(); next(); next(); next();
        return { ast: 'list', children: [] }
      }

      if (tryConsume('set', '$', ':dot', '$', 'to')) {
        next()
        const target = (next() as BasicToken).value
        expect('dot')
        const targetProperty = parseExpression()
        expect('word', 'to')
        const newValue = parseExpression()
        return { ast: 'setProperty', children: [target, targetProperty, newValue] }
      }

      if (tryConsume('$', 'is', 'not', '$')) {
        const left = parseAtom()
        expect('word', 'is')
        expect('word', 'not')
        const right = parseAtom()
        return { ast: 'comparison', children: [left, {ast: 'negation', children: [right]}] }
      }

      if (tryConsume('$', 'is', 'either', '$', 'or', '$')) {
        const left = parseAtom()
        expect('word', 'is')
        expect('word', 'either')
        const right1 = parseAtom()
        expect('word', 'or')
        const right2 = parseAtom()
        if (is('comma')) next() // optional comma
        return {
          ast: 'or',
          children: [
            { ast: 'comparison', children: [left, right1] },
            { ast: 'comparison', children: [left, right2] },
          ]
        }
      }

      if (tryConsume('$', 'is', '$')) {
        const left = parseAtom()
        expect('word', 'is')
        const right = parseAtom()
        if (is('comma')) next() // optional comma
        return { ast: 'comparison', children: [left, right] }
      }

      if (tryConsume('throw', 'a', '$', 'exception')) {
        next()
        next()
        const value = parseAtom()
        next()
        return { ast: 'throw', children: [value] }
      }

      // Property access
      // -------
      if (tryConsume('$', ':dot', '$')) {
        const target = parseAtom()
        expect('dot')
        const targetProperty = parseAtom()
        return { ast: 'property-access', children: [target, targetProperty] }
      }

      // Function call
      // -------
      if (tryConsume('perform', ':function-name')) {
        next()
      }

      if (is('function-name') && afterIs('lParen')) {
        const name = expect('function-name').value
        expect('lParen')
        const args = []
        while (!ended() && !is('rParen')) {
          args.push(parseExpression())
          if (is('comma')) {
            expect('comma')
          }
        }
        expect('rParen')
        return { ast: 'call', children: [name, args] }
      }

      // Atoms
      // -------
      if (is('word') || is('value') || is('identifier') || is('slot-identifier')) {
        return parseAtom()
      }

      if (is('lList')) {
        next()
        const items = []
        while (!ended() && !is('rList')) {
          items.push(parseExpression())
          if (is('comma')) {
            expect('comma')
          }
        }
        next()
        return { ast: 'list', children: items }
      }

      throw new Error('garbage at end of expression: ' + inspect(tokens))
    }

    const base = beforeSuffix()
    if (base && tryConsume('is', ':value')) {
      next()
      return { ast: 'comparison', children: [base, parseAtom()] }
    } else if (base && tryConsume('and')) {
      next()
      return { ast: 'and', children: [base, parseExpression()]}
    } else if (base) {
      return base
    }

    throw new Error('garbage at the end ' + inspect(tokens))
  }

  let rootExpressions: AlgorithmNode[] = []

  //while (cur()) {
  rootExpressions.push(parseExpression())
  if (!ended()) {
    return rootExpressions.concat({ ast: 'unknown', children: ['GARBAGE AT END', ...tokens] })
  }
  //}
  return rootExpressions
}

export function parseAlgorithmStep(node: HTMLElement): Algorithm {
  let tokens = tokenizeNodes({    tokenizer: algorithmTokenizer, nodes: node.childNodes  })

  return parseAlgorithmStepTokens(tokens)
}

export function parseAlgorithmList(liChildren: HTMLLIElement[]): Algorithm {
  const li = liChildren.filter(child => child.tagName === 'LI')
  assert(liChildren.length === li.length, 'expected <ol> to only have <li>')

  // TODO split steps!
  return [...li].flatMap(parseAlgorithmStep)
}

export function parseAlgorithm({ algorithm }: HTMLAlgorithm): Algorithm {

  const ol = getOnly(algorithm.childNodes)
  assert(ol.tagName === 'OL', 'expected ol')

  return (parseAlgorithmList(ol.childNodes))
}

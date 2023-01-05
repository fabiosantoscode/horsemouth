// HACK: Use nearley without a compilation step.
// In the future, this can be generated with nearley's CLI tool for releases
// but for testing/scripting this is better.

import { readFileSync } from 'fs'
import { Grammar, Parser } from 'nearley'
import { algorithmTokenizer } from './tokenizer'
import assert from 'assert'


// @ts-ignore
import pkg from 'nearley/package.json'
// @ts-ignore
import compileGrammar from 'nearley/lib/compile'
// @ts-ignore
import generateGrammar from 'nearley/lib/generate'
// @ts-ignore
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped'


// Use nearley's grammar to parse our grammar
let inGrammar = new Parser(nearleyGrammar).feed(readFileSync(__dirname + '/grammar/grammar.ne', 'utf8')).finish()[0]

// recursively find objects with .include strings, read the files, and replace them with the contents
function replaceIncludes(grammar) {
  return grammar.flatMap((obj) => {
    if (obj && obj.include) {
      const filename = obj.include
      const contents = readFileSync(__dirname + '/' + filename, 'utf8')
      return new Parser(nearleyGrammar).feed(contents).finish()[0]
    }
    return obj
  })
}

inGrammar = replaceIncludes(inGrammar)

const ourGrammar = compileGrammar(inGrammar, { version: pkg.version })
const ourCode = generateGrammar(ourGrammar)

export default (() => {
  const module: any = { exports: 1 }

  // eslint-ignore-next-line no-eval
  new Function('module, tokenizer', ourCode)(module, algorithmTokenizer)

  assert(typeof module.exports === 'object')

  return module.exports
})() as Grammar

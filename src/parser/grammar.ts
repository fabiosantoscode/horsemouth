// HACK: Use nearley without a compilation step.
// In the future, this can be generated with nearley's CLI tool for releases
// but for testing/scripting this is better.

import { readFileSync } from 'fs'
import { Grammar, Parser } from 'nearley'
import { algorithmEnhancedTokenizer } from './tokenizer'
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
const inGrammar = new Parser(nearleyGrammar).feed(readFileSync(__dirname + '/grammar.ne', 'utf8')).finish()

const ourGrammar = compileGrammar(inGrammar[0], { version: pkg.version })
const ourCode = generateGrammar(ourGrammar)

export default (() => {
  const module: any = { exports: 1 }

  // eslint-ignore-next-line no-eval
  new Function('module, tokenizer', ourCode)(module, algorithmEnhancedTokenizer)

  assert(typeof module.exports === 'object')

  return module.exports
})() as Grammar

import { HTMLOListElement, parseHTML } from "linkedom"
import { getOnly } from "../utils/getOnly"
import { algorithmEnhancedTokenizer } from "./tokenizer"

expect.addSnapshotSerializer({
  test: val => val && val.type && typeof val.value === 'string',
  print: (val, print) => `Token( ${val.type}: ${print(val.value)} )`,
})

const { document } = parseHTML('<li>For each element <var>e</var> of <var>entries</var>, do<ol><li>If <var>e</var> is not <emu-const>empty</emu-const> and <emu-xref aoid="SameValueZero" id="_ref_11917"><a href="#sec-samevaluezero">SameValueZero</a></emu-xref>(<var>e</var>, <var>value</var>) is <emu-val>true</emu-val>, then<ol><li>Return <var>S</var>.</li></ol></li></ol></li>')
const li = getOnly(document.childNodes)

const ol = (li.children.pop())

it('tokenizes DOM nodes', () => {
  expect([...algorithmEnhancedTokenizer.reset([ol])]).toMatchInlineSnapshot(`
    [
      Token( lDo: "" ),
      Token( word: "If" ),
      Token( identifier: "e" ),
      Token( word: "is" ),
      Token( word: "not" ),
      Token( value: "empty" ),
      Token( word: "and" ),
      Token( function-name: "SameValueZero" ),
      Token( lParen: "(" ),
      Token( identifier: "e" ),
      Token( comma: "," ),
      Token( identifier: "value" ),
      Token( rParen: ")" ),
      Token( word: "is" ),
      Token( value: "true" ),
      Token( comma: "," ),
      Token( word: "then" ),
      Token( lDo: "" ),
      Token( word: "Return" ),
      Token( identifier: "S" ),
      Token( endStatement: ";" ),
      Token( rDo: "" ),
      Token( endStatement: ";" ),
      Token( rDo: "" ),
      Token( endStatement: ";" ),
    ]
  `)
})


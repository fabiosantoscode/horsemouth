import { parseHTML } from "linkedom"
import { algorithmTokenizer } from "../parser/parse"
import { getOnly } from "../utils/getOnly"
import { tokenizeNodes } from "./tokenizeNodes"

it('tokenizes stuff' , () => {
  const {document} = parseHTML('<li>For each element <var>e</var> of <var>entries</var>, do<ol><li>If <var>e</var> is not <emu-const>empty</emu-const> and <emu-xref aoid="SameValueZero" id="_ref_11917"><a href="#sec-samevaluezero">SameValueZero</a></emu-xref>(<var>e</var>, <var>value</var>) is <emu-val>true</emu-val>, then<ol><li>Return <var>S</var>.</li></ol></li></ol></li>')
  const li = getOnly( document.childNodes)

  expect(tokenizeNodes({ tokenizer: algorithmTokenizer, nodes: li.childNodes })).toMatchInlineSnapshot(`
[
  {
    "type": "word",
    "value": "For",
  },
  {
    "type": "word",
    "value": "each",
  },
  {
    "type": "word",
    "value": "element",
  },
  {
    "type": "identifier",
    "value": "e",
  },
  {
    "type": "word",
    "value": "of",
  },
  {
    "type": "identifier",
    "value": "entries",
  },
  {
    "type": "comma",
    "value": ",",
  },
  {
    "type": "word",
    "value": "do",
  },
  {
    "type": "supertoken",
    "value": [
      [
        {
          "type": "word",
          "value": "If",
        },
        {
          "type": "identifier",
          "value": "e",
        },
        {
          "type": "word",
          "value": "is",
        },
        {
          "type": "word",
          "value": "not",
        },
        {
          "type": "value",
          "value": "empty",
        },
        {
          "type": "word",
          "value": "and",
        },
        {
          "type": "function-name",
          "value": "SameValueZero",
        },
        {
          "type": "lParen",
          "value": "(",
        },
        {
          "type": "identifier",
          "value": "e",
        },
        {
          "type": "comma",
          "value": ",",
        },
        {
          "type": "identifier",
          "value": "value",
        },
        {
          "type": "rParen",
          "value": ")",
        },
        {
          "type": "word",
          "value": "is",
        },
        {
          "type": "value",
          "value": "true",
        },
        {
          "type": "comma",
          "value": ",",
        },
        {
          "type": "word",
          "value": "then",
        },
        {
          "type": "supertoken",
          "value": [
            [
              {
                "type": "word",
                "value": "Return",
              },
              {
                "type": "identifier",
                "value": "S",
              },
            ],
          ],
        },
      ],
    ],
  },
]
`)
})

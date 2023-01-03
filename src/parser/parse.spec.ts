import { readFileSync } from "fs"
import { HTMLElement, parseHTML } from "linkedom"
import { Parser } from "nearley"
import '../experiments'
import { findAlgorithms } from "../html-parsing/findAlgorithms"
import { parseAlgorithmStep } from "./parse"


const { document } = parseHTML(readFileSync(__dirname + '/../test-sections/keyed-collections.html', 'utf8')
)

import Grammar from './grammar'
import { algorithmEnhancedTokenizer } from "./tokenizer"


const algorithms = findAlgorithms(document.querySelectorAll('#sec-set-objects emu-clause'))

const alg = algorithms[0].algorithm
const steps = [...alg.childNodes[0].childNodes]

it.only('xx using grammar', () => {
  // if `newtarget` is undefined, throw a TypeError exception
  console.log(new Parser(Grammar, {
    lexer: algorithmEnhancedTokenizer
  }).feed([steps[0]]).finish())
})

return

describe('can read the algo steps for a constructor', () => {
  it('if newtarget is undefined, throw a TypeError exception', () => {
    expect(parseAlgorithmStep(steps[0])).toMatchInlineSnapshot(`
    [
      (condition [
        (comparison [
          NewTarget,
          lit undefined,
        ]),
        (throw [
          lit TypeError,
        ]),
        undefined,
      ]),
    ]
  `)
  })

  it('let set be ? OrdinaryCreateFromConstructor(NewTarget, "%SetPrototype%", « [[SetData]] »)', () => {
    // let "set" be ? OrdinaryCreateFromConstructor(newtarget, "%SetPrototype%", « [[SetData]] »)
    expect(parseAlgorithmStep(steps[1])).toMatchInlineSnapshot(`
    [
      (let [
        "set",
        (call [
          "OrdinaryCreateFromConstructor",
          [
            NewTarget,
            lit "%Set.prototype%",
            (list [
              [[SetData]],
            ]),
          ],
        ]),
      ]),
    ]
  `)
  })

  // set set.[[SetData]] = new Set()
  it('set set.[[SetData]] = new Set()', () => {
    expect(parseAlgorithmStep(steps[2])).toMatchInlineSnapshot(`
[
  (setProperty [
    "set",
    [[SetData]],
    (list []),
  ]),
]
`)
  })

  it('if iterable is either undefined or null, return set', () => {
    expect(parseAlgorithmStep(steps[3])).toMatchInlineSnapshot(`
[
  (condition [
    (or [
      (comparison [
        iterable,
        lit undefined,
      ]),
      (comparison [
        iterable,
        lit null,
      ]),
    ]),
    (return [
      set,
    ]),
    undefined,
  ]),
]
`)
  })

  it('let adder be ? Get(set, "add")', () => {
    expect(parseAlgorithmStep(steps[4])).toMatchInlineSnapshot(`
[
  (let [
    "adder",
    (call [
      "Get",
      [
        set,
        lit "add",
      ],
    ]),
  ]),
]
`)
  })

  it('if IsCallable(adder) is false, throw a TypeError exception', () => {
    expect(parseAlgorithmStep(steps[5])).toMatchInlineSnapshot(`
[
  (condition [
    (comparison [
      (call [
        "IsCallable",
        [
          adder,
        ],
      ]),
      lit false,
    ]),
    (throw [
      lit TypeError,
    ]),
    undefined,
  ]),
]
`)
  })

  it('let iteratorRecord be ? GetIterator(iterable)', () => {
    expect(parseAlgorithmStep(steps[6])).toMatchInlineSnapshot(`
[
  (let [
    "iteratorRecord",
    (call [
      "GetIterator",
      [
        iterable,
      ],
    ]),
  ]),
]
`)
  })

  it('repeat, (add each item in iter to set)', () => {
    expect(parseAlgorithmStep(steps[7])).toMatchInlineSnapshot(`
[
  (repeat [
    (do [
      [
        (let [
          "next",
          (call [
            "IteratorStep",
            [
              iteratorRecord,
            ],
          ]),
        ]),
      ],
      [
        (condition [
          (comparison [
            next,
            lit false,
          ]),
          (return [
            set,
          ]),
          undefined,
        ]),
      ],
      [
        (let [
          "nextValue",
          (call [
            "IteratorValue",
            [
              next,
            ],
          ]),
        ]),
      ],
      [
        (let [
          "status",
          (call [
            "Completion",
            [
              (call [
                "Call",
                [
                  adder,
                  set,
                  (list [
                    nextValue,
                  ]),
                ],
              ]),
            ],
          ]),
        ]),
      ],
      [
        (call [
          "IfAbruptCloseIterator",
          [
            status,
            iteratorRecord,
          ],
        ]),
      ],
    ]),
  ]),
]
`)
  })
})

describe('can read the algo steps for a method', () => {
  const algorithms = findAlgorithms(document.querySelectorAll('[id="sec-set.prototype.add"]'))

  const alg = algorithms[0].algorithm
  const steps = [...alg.childNodes[0].childNodes] as HTMLElement[]

  it('let S be the this value', () => {
    expect(parseAlgorithmStep(steps[0])).toMatchInlineSnapshot(`
    [
      (let [
        "S",
        lit this,
      ]),
    ]
  `)
  })

  it('perform RequireInternalSlot(S, [[SetData]])', () => {
    expect(parseAlgorithmStep(steps[1])).toMatchInlineSnapshot(`
    [
      (call [
        "RequireInternalSlot",
        [
          S,
          [[SetData]],
        ],
      ]),
    ]
    `)
  })

  it('let entries be the List that is the value of S.[[SetData]]', () => {
    expect(parseAlgorithmStep(steps[2])).toMatchInlineSnapshot(`
    [
      (let [
        "entries",
        (property-access [
          S,
          [[SetData]],
        ]),
      ]),
    ]
    `)
  })

  it('for each element e of entries, do ', () => {
    expect(parseAlgorithmStep(steps[3])).toMatchInlineSnapshot(`
    [
      (for [
        "e",
        entries,
        (do [
          [
            (condition [
              (and [
                (comparison [
                  e,
                  (negation [
                    lit empty,
                  ]),
                ]),
                (comparison [
                  (call [
                    "SameValueZero",
                    [
                      e,
                      value,
                    ],
                  ]),
                  lit true,
                ]),
              ]),
              (do [
                [
                  (return [
                    S,
                  ]),
                ],
              ]),
              undefined,
            ]),
          ],
        ]),
      ]),
    ]
    `)
  })

})

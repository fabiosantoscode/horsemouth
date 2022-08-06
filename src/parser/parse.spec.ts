import { readFileSync } from "fs"
import { HTMLElement, parseHTML } from "linkedom"
import { inspect } from "util"
import '../experiments'
import { findAlgorithms } from "../html-parsing/findAlgorithms"
import { tokenizeNodes } from "../parse-tools/tokenizeNodes"
import { algorithmTokenizer, parseAlgorithmStep } from "./parse"


const { document } = parseHTML(readFileSync(__dirname + '/../test-sections/keyed-collections.html', 'utf8')
)

it('can read the algo steps for a constructor', () => {
  const algorithms = findAlgorithms(document.querySelectorAll('#sec-set-objects emu-clause'))


  const alg = algorithms[0].algorithm
  const steps = [...alg.childNodes[0].childNodes]

  // if `newtarget` is undefined, throw a TypeError exception
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

  // set set.[[SetData]] = new Set()
  expect(parseAlgorithmStep(steps[2])).toMatchInlineSnapshot(`
[
  (setProperty [
    "set",
    [[SetData]],
    (list []),
  ]),
]
`)

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

  expect(parseAlgorithmStep(steps[7])).toMatchInlineSnapshot(`
[
  (repeat [
    (let [
      "next",
      (call [
        "IteratorStep",
        [
          iteratorRecord,
        ],
      ]),
    ]),
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
    (let [
      "nextValue",
      (call [
        "IteratorValue",
        [
          next,
        ],
      ]),
    ]),
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
    (call [
      "IfAbruptCloseIterator",
      [
        status,
        iteratorRecord,
      ],
    ]),
  ]),
]
`)
})

it.only('can read the algo steps for a method', () => {
  const algorithms = findAlgorithms(document.querySelectorAll('[id="sec-set.prototype.add"]'))


  const alg = algorithms[0].algorithm
  const steps = [...alg.childNodes[0].childNodes] as HTMLElement[]

  expect(parseAlgorithmStep(steps[0])).toMatchInlineSnapshot(`
[
  (let [
    "S",
    lit this,
  ]),
]
`)

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

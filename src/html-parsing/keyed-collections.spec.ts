import { readFileSync } from "fs"
import { parseHTML } from "linkedom"
import '../experiments'
import { getAlgorithmHead } from "./AlgorithmHead"
import { findAlgorithms, HTMLAlgorithm } from "./findAlgorithms"


const { document } = parseHTML(readFileSync(__dirname + '/../test-sections/keyed-collections.html', 'utf8')
)

const sections = (document.querySelectorAll('#sec-set-objects emu-clause'))

const algorithms: HTMLAlgorithm[] = sections.flatMap(findAlgorithms)

it('can find the sections containing methods', () => {
  expect(algorithms.length).toBeGreaterThan(0)
})

it('can grab the kind of method in an algo', () => {
  const alg = algorithms[0]

  expect(getAlgorithmHead(alg)).toMatchInlineSnapshot(`
    {
      "args": [
        {
          "argName": "iterable",
          "isOptional": true,
        },
      ],
      "name": "Set",
      "type": "function",
    }
  `)
})

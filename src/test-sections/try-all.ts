import fs from "fs";
import { parseHTML } from "linkedom";
import path from "path";
import "../experiments";
import { walk } from "../parser-tools/walk";
import { AlgorithmBlock, parseAlgorithmBlock } from "../parser/parse";
import { stringifyToJs } from "../stringify/stringifyToJs";
import {findWellKnownSymbols} from '../wellKnownSymbols/index';

// read ./keyed-collections.html
const keyedCollections = fs.readFileSync(
  path.join(__dirname, "ecmascript-2021.html"),
  "utf8"
);

const { document } = parseHTML(keyedCollections);

findWellKnownSymbols(document)

const clauses = [
  ...document.querySelectorAll(
    "#sec-type-conversion emu-alg"
    // "#sec-properties-of-the-regexp-prototype-object emu-alg"
    // "#sec-operations-on-objects emu-alg"
    // "#sec-map-objects emu-alg"
    // "#sec-structured-data emu-alg"
  ),
].flatMap((algorithm) => {
  const clause = algorithm.closest("emu-clause");

  const howManyAlgorithmsInClause = [...(clause?.children ?? [])].filter(
    (node) => node.tagName === "EMU-ALG"
  ).length;

  if (
    algorithm.closest("emu-note") ||
    !clause ||
    !clause.id ||
    algorithm.hasAttribute("example") ||
    clause.hasAttribute("namespace") ||
    clause.id.startsWith("await") ||
    howManyAlgorithmsInClause !== 1
  ) {
    return [];
  }

  return [
    {
      section: clause,
      algorithm,
    },
  ];
});

const toStringify: AlgorithmBlock[] = [];

for (const htmlAlg of clauses) {
  const algorithm = parseAlgorithmBlock(htmlAlg, { allowUnknown: true });

  toStringify.push(algorithm);
}

const stringified = stringifyToJs(toStringify, document);

fs.writeFileSync(__dirname + "/stringified.js", stringified);

const unknownFrequencies = new Map<string, number>();
const addUnknownFrequency = (unknownString: string) => {
  unknownFrequencies.set(
    unknownString,
    (unknownFrequencies.get(unknownString) ?? 0) + 1
  );
};

let unknownCount = 0;
let functionsWithoutUnknown = 0;
let functionsWithUnknown = 0;
let functionsWithEveryStatementUnknown = 0;
for (const algorithm of toStringify) {
  let unknownCountHere = 0;
  walk(algorithm, (node) => {
    if (node.ast === "unknown") {
      unknownCountHere++;

      node.children.forEach((child) => {
        if (typeof child === "string") {
          addUnknownFrequency(child);
          addUnknownFrequency(child.slice(0, 20));
        }
      });
    }
  });

  if (unknownCountHere === 0) {
    functionsWithoutUnknown++;
  } else {
    functionsWithUnknown++;
  }
  const everyStatementUnknown = algorithm.children.every(
    (node) => node.ast === "unknown"
  );
  if (everyStatementUnknown) {
    functionsWithEveryStatementUnknown++;
  }
  unknownCount += unknownCountHere;
}

for (const [title, contents] of Object.entries({
  "Function count": toStringify.length,
  "Times that 'unknown' structure was used": unknownCount,
  "Functions that don't need 'unknown'": functionsWithoutUnknown,
  "Functions that used 'unknown'":
    functionsWithUnknown +
    " (" +
    Math.round(((functionsWithUnknown / toStringify.length) * 1000) / 10) +
    "%)",
  "Functions entirely comprised of 'unknown'":
    functionsWithEveryStatementUnknown +
    " (" +
    Math.round(
      ((functionsWithEveryStatementUnknown / toStringify.length) * 1000) / 10
    ) +
    "%)",
})) {
  console.log(`${title}: ${contents}`);
}

console.log("Top unknowns:");
console.log(
  (() => {
    const sorted = [...unknownFrequencies.entries()].sort(
      ([, a], [, b]) => b - a
    );
    return sorted.slice(0, 10);
  })()
);

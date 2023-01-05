import fs from "fs";
import { HTMLElement, parseHTML } from "linkedom";
import path from "path";
import "../experiments";
import { prettyPrintAST } from "../parser-tools/prettyPrintAST";
import { walk } from "../parser-tools/walk";
import { parseAlgorithm } from "../parser/parse";
import {
  AlgorithmWithMetadata,
  stringifyToJs,
} from "../stringify/stringifyToJs";

// read ./keyed-collections.html
const keyedCollections = fs.readFileSync(
  path.join(__dirname, "ecmascript-2021.html"),
  "utf8"
);

const { document } = parseHTML(keyedCollections);

const algs = document.querySelectorAll("emu-alg") as HTMLElement[];

const toStringify = [] as AlgorithmWithMetadata[];

for (const alg of algs) {
  if (alg.closest("emu-note")) {
    continue;
  }
  const algName = (alg.querySelector("h1, h2, h3") ?? alg.parentNode).id as
    | string
    | undefined;

  const algorithm = parseAlgorithm(alg, { allowUnknown: true });

  toStringify.push({
    headerComment: "// " + alg.parentNode.id,
    algName,
    algorithm,
  });

  console.log(prettyPrintAST(algorithm));
}

console.log(stringifyToJs(toStringify));

const unknownFrequencies = new Map<string, number>();
const addUnknownFrequency = (unknownString: string) => {
  unknownFrequencies.set(
    unknownString,
    (unknownFrequencies.get(unknownString) ?? 0) + 1
  );
};
const top10UnknownFrequencies = () => {
  const sorted = [...unknownFrequencies.entries()].sort(
    ([, a], [, b]) => b - a
  );
  return sorted.slice(0, 10);
};

let unknownCount = 0;
let functionsWithoutUnknown = 0;
let functionsWithUnknown = 0;
let functionsWithEveryStatementUnknown = 0;
for (const { algorithm } of toStringify) {
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
  const everyStatementUnknown = algorithm.every(
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

console.log("Top 10 unknowns:");
console.log(top10UnknownFrequencies());

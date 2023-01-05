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
  path.join(__dirname, "keyed-collections.html"),
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
  try {
    const algorithm = parseAlgorithm(alg, { allowUnknown: true });

    toStringify.push({
      headerComment: "// " + alg.parentNode.id,
      algName,
      algorithm,
    });

    console.log(prettyPrintAST(algorithm));
  } catch (e) {
    console.log(e);
    toStringify.push({
      algName,
      headerComment: `
 // ${alg.parentNode.id}
 /***********************
 * FATAL ERROR
 ***********************
    ${(e as Error).message.replaceAll(/\*\//g, "/")}
    */
    `,
      algorithm: [
        { ast: "unknown", children: alg.children.map((c) => c.textContent) },
      ],
    });
  }
}

console.log(stringifyToJs(toStringify));

let unknownCount = 0;
let functionsWithoutUnknown = 0;
let functionsWithUnknown = 0;
for (const { algorithm } of toStringify) {
  let unknownCountHere = 0;
  walk(algorithm, (node) => {
    if (node.ast === "unknown") {
      unknownCountHere++;
    }
  });

  if (unknownCountHere === 0) {
    functionsWithoutUnknown++;
  } else {
    functionsWithUnknown++;
  }
  unknownCount += unknownCountHere;
}

console.log({
  "Function count": toStringify.length,
  "Times that 'unknown' structure was used": unknownCount,
  "Functions that don't need 'unknown'": functionsWithoutUnknown,
  "Functions that used 'unknown'":
    functionsWithUnknown +
    Math.round(((functionsWithUnknown / toStringify.length) * 1000) / 10) +
    "%",
});

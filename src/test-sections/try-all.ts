import fs from 'fs'
import path from 'path'
import { parseHTML } from "linkedom"
import '../experiments'
import { parseAlgorithm } from "../parser/parse"
import {prettyPrintAST} from '../parser-tools/prettyPrintAST';
import {stringifyToJs} from '../stringify/stringifyToJs';

// read ./keyed-collections.html
const keyedCollections = fs.readFileSync(path.join(__dirname, 'keyed-collections.html'), 'utf8');


const { document } = parseHTML(keyedCollections);

const algs = document.querySelectorAll('emu-alg');

let toStringify = []

let passCount = 0;
let failCount = 0;
for (const alg of algs) {
    const algName = (alg.querySelector('h1, h2, h3') ?? alg.parentNode).id
  try {
    const algorithm = parseAlgorithm(alg, { allowUnknown: true })

    toStringify.push({algName, algorithm})

    console.log('// ' + alg.parentNode.id);
    console.log(prettyPrintAST(algorithm));
    passCount++;
  } catch (e) {
    console.log('// ' + alg.parentNode.id);
    console.log(e);
    toStringify.push({algName, algorithm: [{ ast: 'unknown', children: alg.children.map(c => c.textContent) }]})
    failCount++;
  }
}

console.log(stringifyToJs(toStringify))

console.log({passCount, failCount})

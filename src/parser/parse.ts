import assert from "assert";
import { HTMLElement, HTMLLIElement, HTMLOListElement } from "linkedom";
import "../experiments";
import { algorithmTokenizer, getInnerBlockHack } from "./tokenizer";

import Grammar from "./grammar";
import { Parser } from "nearley";
import { HTMLAlgorithm } from "../html-parsing/findAlgorithms";
import { prettyPrintAST } from "../parser-tools/prettyPrintAST";

export type AlgorithmNode =
  | { ast: "block"; children: AlgorithmNode[] }
  | { ast: "innerBlockHack"; children: [string] }
  | { ast: "repeat"; children: [AlgorithmNode] }
  | { ast: "forEach"; children: [string, AlgorithmNode, AlgorithmNode] }
  | { ast: "block"; children: AlgorithmNode[] }
  | { ast: "string"; children: [string] }
  | { ast: "number"; children: [string] }
  | { ast: "reference"; children: [string] }
  | { ast: "percentReference"; children: [string] }
  | { ast: "slotReference"; children: [string] }
  | { ast: "dottedProperty"; children: [AlgorithmNode, ...AlgorithmNode[]] }
  | { ast: "booleanExpr"; children: [string, AlgorithmNode, AlgorithmNode] }
  | {
      ast: "unaryBooleanExpr";
      children: [string, AlgorithmNode, AlgorithmNode];
    }
  | { ast: "call"; children: [AlgorithmNode, ...AlgorithmNode[]] }
  | { ast: "list"; children: AlgorithmNode[] }
  | { ast: "typeCheck"; children: [string, AlgorithmNode] }
  | {
      ast: "condition";
      children: [AlgorithmNode, AlgorithmNode, AlgorithmNode | undefined];
    }
  | { ast: "let"; children: [AlgorithmNode, AlgorithmNode] }
  | { ast: "set"; children: [AlgorithmNode, AlgorithmNode] }
  | { ast: "return_"; children: [AlgorithmNode] }
  | { ast: "throw_"; children: [AlgorithmNode] }
  | { ast: "unknown"; children: (string | AlgorithmNode[])[] };

export type NodeOfType<T extends AlgorithmNode["ast"]> = Extract<
  AlgorithmNode,
  { ast: T }
>;

export type Algorithm = AlgorithmNode[];

const nonEmptyText = (node: HTMLElement) =>
  node.childNodes.filter(
    (node) => node.tagName || node.textContent.trim() !== ""
  );

interface ParseOpts {
  allowUnknown?: boolean;
}

export function parseAlgorithm(node: HTMLElement, opts: ParseOpts): Algorithm {
  assert.equal(node.tagName, "EMU-ALG", "algorithms are <EMU-ALG> elements");
  const steps = [...node.children[0].children];
  return steps.map((algoStep) => parseAlgorithmStep(algoStep, opts));
}

export function parseAlgorithmStep(
  node: HTMLElement,
  opts: ParseOpts = {}
): AlgorithmNode {
  assert.equal(node.tagName, "LI", "algorithm steps are <li> elements");

  const cleanedSteps = [...node.childNodes].flatMap((child) => {
    if (child.tagName && child.getAttribute("aria-hidden")) {
      // Steps are numbered with little spans. Assume everything aria-hidden is irrelevant
      return [];
    }
    return [child];
  });

  // We're going to be replacing inner blocks with fake tokens, so we need to keep track of them
  const blockReferences: HTMLOListElement[] = [];
  const sourceText = cleanedSteps
    .map((child) => {
      if (child.tagName === "OL") {
        const index = blockReferences.length;
        blockReferences.push(child);
        return getInnerBlockHack(index);
      } else {
        return child.textContent.trim();
      }
    })
    .join(" ");

  let [parseError, parsed] = justParse(sourceText.toLocaleLowerCase());
  if (parseError) {
    if (!opts.allowUnknown) throw parseError;

    // Return an unknown node so the user can deal with it
    return {
      ast: "unknown",
      children: cleanedSteps
        .map((child) => {
          if (child.tagName === "OL") {
            return child.children.map(parseAlgorithmStep);
          }
          return child.textContent;
        })
        .reduce(
          // join adjacent strings
          (acc, cur) => {
            if (
              typeof cur === "string" &&
              typeof acc[acc.length - 1] === "string"
            ) {
              acc[acc.length - 1] += cur;
            } else {
              acc.push(cur);
            }
            return acc;
          },
          []
        ),
    };
  }

  parsed = mapTree(parsed!, (node) => {
    if (node.ast === "innerBlockHack") {
      const n = blockReferences[Number(node.children[0])];
      if (!n) {
        throw new Error(`invalid inner block hack: ${node.children[0]}`);
      }
      const children = [...n.children].map((step) =>
        parseAlgorithmStep(step, opts)
      );
      return {
        ast: "block",
        children,
      };
    }
    return node;
  });
  nodeSources.set(parsed, sourceText);
  return parsed;
}

const nodeSources = new WeakMap<AlgorithmNode, string>();
export const getNodeSource = (node: AlgorithmNode) => nodeSources.get(node);

const mapTree = (
  algo: AlgorithmNode,
  fn: (node: AlgorithmNode) => AlgorithmNode
): AlgorithmNode => {
  return fn({
    ...algo,
    children: algo.children.map((child) => {
      if (Array.isArray(child)) {
        return child.map((node) => mapTree(node, fn));
      } else if (!child || typeof child !== "object") {
        return child;
      } else {
        return mapTree(child, fn);
      }
    }),
  });
};

/** plainly parse with our grammar and handle ambiguity errors */
const justParse = (source = ""): [Error, null] | [null, AlgorithmNode] => {
  const parser = new Parser(Grammar, { lexer: algorithmTokenizer });
  let solutions;
  try {
    solutions = parser.feed(source.toLocaleLowerCase()).finish();
  } catch (e) {
    return [e as Error, null];
  }

  switch (solutions.length) {
    case 0: {
      return [new Error("no solutions found"), null];
    }
    case 1: {
      return [null, solutions[0]];
    }
    default: {
      for (const solution of solutions) {
        const pretty = prettyPrintAST(solution);
        console.log(pretty);
      }
      // This is a real error
      throw new Error("multiple solutions found");
    }
  }
};

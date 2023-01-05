import "../experiments";
import { algorithmTokenizer } from "./tokenizer";

import { Parser } from "nearley";
import {
  AlgorithmBlockFromHtml,
  AlgorithmStepFromHtml,
  getAlgorithmBlockFromHtml,
  getAlgorithmStepFromHtml
} from "../html-parsing/getAlgorithmFromHtml";
import { prettyPrintAST } from "../parser-tools/prettyPrintAST";
import { mapTree } from "../parser-tools/walk";
import Grammar from "./grammar";

export type AlgorithmBlock = { ast: "block"; sourceBlock: AlgorithmBlockFromHtml, children: AlgorithmNode[] }

export type AlgorithmNode =
  | AlgorithmBlock
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
  | { ast: "binaryExpr"; children: [string, AlgorithmNode, AlgorithmNode] }
  | {
      ast: "unaryExpr";
      children: [string, AlgorithmNode, AlgorithmNode];
    }
  | { ast: "call"; children: [AlgorithmNode, ...AlgorithmNode[]] }
  | { ast: "list"; children: AlgorithmNode[] }
  | { ast: "typeCheck"; children: [AlgorithmNode, AlgorithmNode] }
  | {
      ast: "condition";
      children: [AlgorithmNode, AlgorithmNode, AlgorithmNode | undefined];
    }
  | { ast: "let"; children: [AlgorithmNode, AlgorithmNode] }
  | { ast: "set"; children: [AlgorithmNode, AlgorithmNode] }
  | { ast: "return_"; children: [AlgorithmNode] }
  | { ast: "throw_"; children: [AlgorithmNode] }
  | { ast: "unknown"; children: (string | AlgorithmNode)[] };

export type NodeOfType<T extends AlgorithmNode["ast"]> = Extract<
  AlgorithmNode,
  { ast: T }
>;

export type Algorithm = AlgorithmNode[];

interface ParseOpts {
  allowUnknown?: boolean;
}

export function parseAlgorithmBlock(
  node: Element | AlgorithmBlockFromHtml,
  opts: ParseOpts = {},
): AlgorithmBlock {
  const sourceBlock = getAlgorithmBlockFromHtml(node)

  const steps = sourceBlock.steps;
  return {
    ast: 'block',
    sourceBlock,
    children: steps.map((algoStep) => parseAlgorithmStep(algoStep, opts))
  };
}

export function parseAlgorithmStep(
  node: Element | AlgorithmStepFromHtml | string,
  opts: ParseOpts = {}
): AlgorithmNode {
  // We're going to be replacing inner blocks with fake tokens, so we need to keep track of them
  const { sourceText, blockReferences } = getAlgorithmStepFromHtml(node);

  const getParsedBlockFromIndex = (index: number|string) => {
    const block = blockReferences[Number(index)];
    if (!block) {
      throw new Error(`invalid inner block hack: ${index}`);
    }
    return parseAlgorithmBlock(block, opts);
  };

  const [parseError, parsed] = justParse(sourceText.toLocaleLowerCase());

  let returnedAst: AlgorithmNode;

  if (parseError !== "ok") {
    if (!opts.allowUnknown) {
      throw parsed instanceof Error
        ? parsed
        : new Error(
            parsed
              .map((a) => prettyPrintAST(a))
              .join("\n... is ambiguous with ...\n")
          );
    }

    // Return an unknown node so the user can deal with it
    returnedAst = {
      ast: "unknown",
      children: (
        [...algorithmTokenizer.reset(sourceText)].map((tok) => {
          if (tok.type === "innerBlockHack") {
            return getParsedBlockFromIndex((tok.value));
          }
          return tok.text;
        }) as AlgorithmNode[]
      )
        .reduce(
          // join adjacent strings
          (acc, cur) => {
            if (
              typeof cur === "string" &&
              typeof acc[acc.length - 1] === "string"
            ) {
              acc[acc.length - 1] += " " + cur;
            } else {
              acc.push(cur);
            }
            return acc;
          },
          [] as (string | AlgorithmNode)[]
        )
        .concat(
          parseError === "parseError"
            ? []
            : parsed.map(
                (ambiguousSolution, i) =>
                  ` (ambiguous reading ${i}: ${prettyPrintAST(
                    ambiguousSolution
                  )})`
              )
        ),
    };
  } else {
    returnedAst = mapTree(parsed, (node) => {
      if (node.ast === "innerBlockHack") {
        return getParsedBlockFromIndex(node.children[0])
      }
      return node;
    });
  }

  nodeSources.set(returnedAst, sourceText);
  return returnedAst;
}

const nodeSources = new WeakMap<AlgorithmNode, string>();
export const getNodeSource = (node: AlgorithmNode) => nodeSources.get(node);

/** plainly parse with our grammar and understand the error (if any) */
const justParse = (
  source = ""
):
  | ["parseError", Error]
  | ["ambiguityError", AlgorithmNode[]]
  | ["ok", AlgorithmNode] => {
  const parser = new Parser(Grammar, { lexer: algorithmTokenizer });
  let solutions;
  try {
    solutions = parser.feed(source.toLocaleLowerCase()).finish();
  } catch (e) {
    return ["parseError", e as Error];
  }

  switch (solutions.length) {
    case 0: {
      return ["parseError", new Error("no solutions found")];
    }
    case 1: {
      return ["ok", solutions[0]];
    }
    default: {
      return ["ambiguityError", solutions];
    }
  }
};

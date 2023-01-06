import "../experiments";
import { algorithmTokenizer } from "./tokenizer";

import { Parser } from "nearley";
import {
  AlgorithmBlockFromHtml,
  AlgorithmStepFromHtml,
  getAlgorithmBlockFromHtml,
  getAlgorithmStepFromHtml,
} from "../html-parsing/getAlgorithmFromHtml";
import { prettyPrintAST } from "../parser-tools/prettyPrintAST";
import { mapTree } from "../parser-tools/walk";
import Grammar from "./grammar/grammar";
import { AlgorithmUsage } from "../html-parsing/AlgorithmHead";
import { HTMLAlgorithm } from "../html-parsing/findAlgorithms";

export type AlgorithmBlock = {
  ast: "block";
  usage?: AlgorithmUsage;
  children: AlgorithmNode[];
};

export type ElseNode = { ast: "else"; children: [AlgorithmNode] };

export type AlgorithmNode =
  | Expression
  | AlgorithmBlock
  | { ast: "assert"; children: [Expression] }
  | { ast: "repeat"; children: [AlgorithmNode] }
  | { ast: "repeatWhile"; children: [Expression, AlgorithmNode] }
  | { ast: "forEach"; children: [string, AlgorithmNode, AlgorithmNode] }
  | {
      ast: "condition";
      children: [AlgorithmNode, AlgorithmNode, ...ElseNode[]];
    }
  | ElseNode
  | { ast: "let"; children: [ReferenceLike, Expression] }
  | { ast: "set"; children: [Lhs, Expression] }
  | { ast: "return_"; children: [Expression] }
  | { ast: "throw_"; children: [Expression] }
  | { ast: "unknown"; children: (string | AlgorithmNode)[] }
  | { ast: "innerBlockHack"; children: [string] }
  | { ast: "comment"; children: [string] };

export type ReferenceLike =
  | { ast: "reference"; children: [string] }
  | { ast: "percentReference"; children: [string] }
  | { ast: "slotReference"; children: [string] }
  | { ast: "wellKnownSymbol"; children: [string] };

export type Lhs =
  | ReferenceLike
  | { ast: "dottedProperty"; children: [ReferenceLike, ...ReferenceLike[]] };

export type Expression =
  | Lhs
  | { ast: "string"; children: [string] }
  | { ast: "hasSlot"; children: [Expression, ReferenceLike] }
  | { ast: "number"; children: [string] }
  | { ast: "float"; children: [number] }
  | { ast: "bigint"; children: [BigInt] }
  | { ast: "binaryExpr"; children: [string, Expression, Expression] }
  | { ast: "unaryExpr"; children: [string, Expression, Expression] }
  | { ast: "call"; children: [Expression, ...Expression[]] }
  | { ast: "list"; children: Expression[] }
  | { ast: "typeCheck"; children: [Expression, Expression] };

export type NodeOfType<T extends AlgorithmNode["ast"]> = Extract<
  AlgorithmNode,
  { ast: T }
>;

export type Algorithm = AlgorithmNode[];

interface ParseOpts {
  allowUnknown?: boolean;
}

export function parseAlgorithmBlock(
  node: Element | HTMLAlgorithm | AlgorithmBlockFromHtml | string[],
  opts: ParseOpts = {}
): AlgorithmBlock {
  const { usage, steps } = getAlgorithmBlockFromHtml(node);

  return {
    ast: "block",
    usage,
    children: combineIfElse(
      steps.map((algoStep) => parseAlgorithmStep(algoStep, opts))
    ),
  };
}

/** if/else statements come in multiple steps but let's fold them into the if right here. */
function combineIfElse(steps: AlgorithmNode[]) {
  return steps.reduce((acc, cur) => {
    let prev = acc[acc.length - 1];
    if (cur.ast === "else") {
      if (prev?.ast === "condition" || prev?.ast === "unknown") {
        if (prev.children[2]?.ast === "else") {
          prev = prev.children[2];
        }
        if (prev.children[2]?.ast === "else") {
          throw new Error("else after else");
        }
        prev.children.push(cur);
        return acc;
      }
      throw new Error("else without if");
    }
    return [...acc, cur];
  }, [] as AlgorithmNode[]);
}

export function parseAlgorithmStep(
  node: Element | AlgorithmStepFromHtml | string,
  opts: ParseOpts = {}
): AlgorithmNode {
  // We're going to be replacing inner blocks with fake tokens, so we need to keep track of them
  const { sourceText, blockReferences } = getAlgorithmStepFromHtml(node);

  if (/^note:/i.test(sourceText.trimStart())) {
    return {
      ast: "comment",
      children: [sourceText],
    };
  }

  const getParsedBlockFromIndex = (index: number | string) => {
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
            return getParsedBlockFromIndex(tok.value);
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
        return getParsedBlockFromIndex(node.children[0]);
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
    solutions = parser
      .feed(source.toLocaleLowerCase().trimEnd().replace(/\.$/, ""))
      .finish();
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

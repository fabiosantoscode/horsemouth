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
import { HTMLAlgorithm } from "../html-parsing/findAlgorithms";
import { AlgorithmBlock, AlgorithmNode, NodeOfType } from "./ast";

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
        pushIntoInnermostElse(prev, cur);
        return acc;
      }
      throw new Error("else without if");
    }
    acc.push(cur);
    return acc;
  }, [] as AlgorithmNode[]);
}

// (if then) -> (if then {else})
// (if then (else (if then))) -> (if then (else (if then {else})))
function pushIntoInnermostElse(
  conditionLike: NodeOfType<"condition" | "unknown">,
  child: NodeOfType<"else">
) {
  if (conditionLike.ast === "unknown") {
    conditionLike.children.push({
      ast: "unknown",
      children: ["else", child],
    });
    return;
  }

  const lastChild = conditionLike.children[2];
  // There's a slot for "else"
  if (lastChild === undefined) {
    conditionLike.children.push(child);
    return;
  }

  if (
    lastChild.ast === "else" &&
    (lastChild.children[0].ast === "condition" ||
      lastChild.children[0].ast === "unknown")
  ) {
    pushIntoInnermostElse(lastChild.children[0], child);
    return;
  }

  throw new Error("invalid if/else structure");
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

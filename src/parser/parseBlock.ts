import {
  AlgorithmBlockFromHtml,
  getAlgorithmBlockFromHtml,
} from "../html-parsing/getAlgorithmFromHtml";
import { HTMLAlgorithm } from "../html-parsing/findAlgorithms";
import { AlgorithmBlock, AlgorithmNode, NodeOfType } from "./ast";
import { ParseOpts, parseAlgorithmStep } from "./parse";

export function parseAlgorithmBlock(
  node: Element | HTMLAlgorithm | AlgorithmBlockFromHtml | string[],
  opts: ParseOpts = {}
): AlgorithmBlock {
  const { steps, ...rest } = getAlgorithmBlockFromHtml(node);

  return {
    ...rest,
    ast: "block",
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

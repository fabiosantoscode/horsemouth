import { Algorithm, AlgorithmNode } from "../parser/ast";
import { getDefined } from "../utils/getDefined";
import { isAlgorithmNode } from "./isAlgorithmNode";

export const walk = (
  node: AlgorithmNode | AlgorithmNode[],
  fn: (node: AlgorithmNode) => void | typeof walkSkip
) => {
  if (Array.isArray(node)) {
    node.forEach((node) => walk(node, fn));
    return;
  } else if (isAlgorithmNode(node)) {
    const ret = fn(node);
    if (ret !== walkSkip) {
      node.children.forEach((child) => {
        if (isAlgorithmNode(node)) {
          walk(child as AlgorithmNode, fn);
        }
      });
    }
  }
};

const walkSkip = Symbol("skip the subtree here");
walk.skip = walkSkip;

export const mapAlgorithm = (
  algo: Algorithm,
  fn: (node: AlgorithmNode) => AlgorithmNode
) => algo.map((node) => mapTree(node, fn));

export const mapTree = (
  algo: AlgorithmNode,
  fn: (node: AlgorithmNode) => AlgorithmNode
): AlgorithmNode => {
  return fn({
    ...algo,
    children: getDefined(algo?.children).map((child) => {
      if (isAlgorithmNode(child)) {
        return mapTree(child, fn);
      } else {
        return child;
      }
    }),
  } as AlgorithmNode);
};

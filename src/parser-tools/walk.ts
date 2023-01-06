import { Algorithm, AlgorithmNode } from "../parser/ast";
import { isAlgorithmNode } from "./isAlgorithmNode";

export const walk = (
  node: AlgorithmNode | AlgorithmNode[],
  fn: (node: AlgorithmNode) => void
) => {
  if (Array.isArray(node)) {
    node.forEach((node) => walk(node, fn));
    return;
  } else if (isAlgorithmNode(node)) {
    fn(node);
    node.children.forEach((child) => {
      if (isAlgorithmNode(node)) {
        walk(child as AlgorithmNode, fn);
      }
    });
  }
};

export const mapAlgorithm = (
  algo: Algorithm,
  fn: (node: AlgorithmNode) => AlgorithmNode
) => algo.map((node) => mapTree(node, fn));

export const mapTree = (
  algo: AlgorithmNode,
  fn: (node: AlgorithmNode) => AlgorithmNode
): AlgorithmNode => {
  if (algo && algo.children) {
    return fn({
      ...algo,
      children: algo.children.map((child) => {
        if (isAlgorithmNode(child)) {
          return mapTree(child, fn);
        } else {
          return child;
        }
      }),
    } as AlgorithmNode);
  } else {
    throw new Error("unreachable");
  }
};

import { AlgorithmNode } from "../parser/ast";

export const isAlgorithmNode = (node: any): node is AlgorithmNode => {
  return (
    node &&
    typeof node === "object" &&
    typeof node.ast === "string" &&
    Array.isArray(node.children)
  );
};

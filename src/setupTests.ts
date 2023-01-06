import { isAlgorithmNode } from "./parser-tools/isAlgorithmNode";
import { prettyPrintAST } from "./parser-tools/prettyPrintAST";
import { AlgorithmNode } from "./parser/ast";

expect.addSnapshotSerializer({
  test: (val) => isAlgorithmNode(val),
  print: (val) => {
    return prettyPrintAST(val as AlgorithmNode);
  },
});

export {};

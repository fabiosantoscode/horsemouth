import { prettyPrintAST } from "./parser-tools/prettyPrintAST";
import { AlgorithmNode } from "./parser/parse";

expect.addSnapshotSerializer({
  test: (val) =>
    val && typeof val.ast === "string" && Array.isArray(val.children),
  print: (val) => {
    return prettyPrintAST(val as AlgorithmNode);
  },
});

export {};

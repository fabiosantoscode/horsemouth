import type { AlgorithmUsage } from "../html-parsing/AlgorithmHead";

export type AlgorithmBlock = {
  ast: "block";
  uniqueId?: string;
  prettyName?: string;
  link?: string;
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
  | { ast: "bigint"; children: [bigint] }
  | { ast: "unknown"; children: (string | AlgorithmNode)[] }
  | { ast: "binaryExpr"; children: [string, Expression, Expression] }
  | { ast: "unaryExpr"; children: [string, Expression, Expression] }
  | { ast: "call"; children: [Expression, ...Expression[]] }
  | { ast: "list"; children: Expression[] }
  | { ast: "typeCheck"; children: [Expression, Expression] }
  | {
      ast: "record";
      children: { ast: "recordField"; children: [string, Expression] }[];
    };

export type NodeOfType<T extends AlgorithmNode["ast"]> = Extract<
  AlgorithmNode,
  { ast: T }
>;

export type Algorithm = AlgorithmNode[];

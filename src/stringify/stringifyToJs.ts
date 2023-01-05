import prettier from "prettier";
import { prettyPrintAST } from "../parser-tools/prettyPrintAST";
import { walk } from "../parser-tools/walk";
import {AlgorithmNode, getNodeSource, AlgorithmBlock} from '../parser/parse';
import { cleanIdentifier } from "../utils/cleanIdentifier";

let unnamedFunctionCount = 0;

export interface AlgorithmWithMetadata {
  algName?: string;
  headerComment?: string;
  algorithm: AlgorithmBlock;
}

export function stringifyToJs(algorithms: AlgorithmWithMetadata[]) {
  unnamedFunctionCount = 0;

  const slots = new Set();
  for (const { algorithm } of algorithms) {
    walk(algorithm.children, (node) => {
      if (node.ast === "slotReference") {
        slots.add(
          `const ${slotVarName(node.children[0])} = Symbol('slot ${
            node.children[0]
          }');`
        );
      }
      if (node.ast === "percentReference") {
        slots.add(
          `const ${percentVarName(node.children[0])} = Symbol('%${
            node.children[0]
          }%');`
        );
      }
    });
  }

  return (
    [...slots].sort().join("\n") +
    "\n\n// The good stuff\n\n" +
    algorithms.map((a) => stringifyAlgorithmToJs(a)).join("\n\n")
  );
}

export function stringifyAlgorithmToJs({
  headerComment,
  algName,
  algorithm,
}: AlgorithmWithMetadata) {
  const fname =
    cleanIdentifier(algName ?? "") ||
    `TODO_unnamedFunction${++unnamedFunctionCount}`;
  const uglyCode = `
${headerComment ?? `/**` + algName + `*/`}
function ${fname}() {
${algorithm.children.map((node) => "    " + stringifyAlgorithmStatement(node)).join("\n")}
}
`;
  return prettier.format(uglyCode, { parser: "babel" });
}

// wrapper to add comment wit source text
const stringifyAlgorithmStatement = (node: AlgorithmNode) => {
  const source = getNodeSource(node);
  return source
    ? `
/** ${source} */
    ${stringifyAlgorithmNodeRaw(node)}`
    : stringifyAlgorithmNodeRaw(node);
};

function stringifyAlgorithmNodeRaw(node: AlgorithmNode): string {
  const s = stringifyAlgorithmStatement;
  switch (node.ast) {
    case "reference": {
      return cleanIdentifier(node.children[0]);
    }
    case "slotReference": {
      return slotVarName(node.children[0]);
    }
    case "percentReference": {
      return percentVarName(node.children[0]);
    }
    case "string": {
      return JSON.stringify(node.children[0]);
    }
    case "number": {
      return node.children[0];
    }
    case "call": {
      const [fname, ...args] = node.children;
      return `${s(fname)}(${args.map(s).join(", ")})`;
    }
    case "list": {
      return `[${node.children.map(s).join(", ")}]`;
    }
    case "typeCheck": {
      const [type, value] = node.children;
      return `(/* I'm going to assume this is a ${s(type)} */ ${s(value)})`;
    }
    case "dottedProperty": {
      const [obj, ...props] = node.children;
      return `${s(obj)}${props.map((prop) => `[${s(prop)}]`).join("")}`;
    }
    case "binaryExpr": {
      const [op, left, right] = node.children;
      return `(${s(left)} ${operator(op)} ${s(right)})`;
    }
    case "unaryExpr": {
      const [op, expr] = node.children;
      return `${operator(op)} ${s(expr)}`;
    }

    // STAT
    case "let": {
      return `var ${cleanIdentifier(s(node.children[0]))} = ${s(
        node.children[1]
      )}`;
    }
    case "set": {
      return `${s(node.children[0])} = ${s(node.children[1])}`;
    }
    case "condition": {
      const [cond, ifTrue, ifFalse] = node.children;
      return `if (${s(cond)}) {
        ${s(ifTrue)}
    }${
      ifFalse
        ? ` else {
        ${s(ifFalse)}
    }`
        : ""
    }`;
    }
    case "forEach": {
      const [item, list, body] = node.children;
      return `for (const ${item} of ${s(list)}) {
        ${s(body)}
    }`;
    }
    case "return_": {
      return `return ${s(node.children[0])};`;
    }
    case "throw_": {
      return `throw ${s(node.children[0])};`;
    }
    case "block": {
      return `{
        ${node.children.map(s).join("\n")}
    }`;
    }
    case "repeat": {
      const [body] = node.children;
      return `while (true) {
        ${s(body)}
    }`;
    }
    case "unknown": {
      return (
        "TODO(" +
        node.children
          .flatMap((child) => {
            if (typeof child === "string") return JSON.stringify(child);
            if (Array.isArray(child))
              return `(() => { ${child.map(s).join("; ")} })()`;
            return `(() => { ${s(child)} })()`;
          })
          .join(", ") +
        ")"
      );
    }
    case "innerBlockHack": {
      throw new Error("Shouldn't be here");
    }
    default: {
      console.error(node);
      throw new Error(`Unknown node type ${node && (node as any).ast}`);
    }
  }
}

const operators = {
  and: "&&",
  or: "||",
  not: "!",
  equals: "===",
  '-': '-',
  '+': '+',
  '*': '*',
  '/': '/',
  '%': '%',
  '<': '<',
  '>': '>',
};

const operator = (op: string): string => {
  if (!(op in operators)) throw new Error(`Unknown operator ${op}`);
  return (operators as any)[op];
};

const slotVarName = (slotName: string) => `slot_${cleanIdentifier(slotName)}`;

const percentVarName = (percentName: string) =>
  `percent_${cleanIdentifier(percentName)}`;

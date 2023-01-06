import prettier from "prettier";
import { walk } from "../parser-tools/walk";
import { AlgorithmBlock, AlgorithmNode } from "../parser/ast";
import { getNodeSource } from "../parser/parse";
import { cleanIdentifier } from "../utils/cleanIdentifier";
import { findWellKnownSymbols } from "../wellKnownSymbols";

let unnamedFunctionCount = 0;

export function stringifyToJs(
  algorithms: AlgorithmBlock[],
  document: Document
) {
  unnamedFunctionCount = 0;

  const slots = new Set();
  for (const algorithm of algorithms) {
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

  for (const wellKnownSymbol of findWellKnownSymbols(document)) {
    slots.add(
      `const ${wellKnownSymbolVarName(
        wellKnownSymbol
      )} = Symbol('@@${wellKnownSymbol.replace("@@", "")}');`
    );
  }

  return (
    [...slots].sort().join("\n") +
    "\n\n// The good stuff\n\n" +
    algorithms.map((a) => stringifyAlgorithmToJs(a)).join("\n\n")
  );
}

export function stringifyAlgorithmToJs({ usage, children }: AlgorithmBlock) {
  const fname =
    cleanIdentifier(usage?.name.join(".") ?? "") ||
    `TODO_unnamedFunction${++unnamedFunctionCount}`;

  const leadingComment = `
    /**
     * ${usage?.name.join(".")}
     * ${JSON.stringify(usage)}
     **/`;
  const functionHead = `
    function ${fname}
    (
      ${usage?.args.map((a) => cleanIdentifier(a.argName)).join(", ") ?? ""}
    )
  `;
  const functionBody = `
    {
      ${children
        .map((node) => "    " + stringifyAlgorithmStatement(node))
        .join("\n")}
    }
  `;

  const fn = leadingComment + functionHead + functionBody;
  try {
    return prettier.format(fn, { parser: "babel" });
  } catch (e) {
    console.error(fn);
    console.error((e as any).codeFrame);
    console.error("------");
    throw new Error(
      "could not prettify. Bad syntax being returned from stringifyToJs most likely."
    );
  }
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
    case "wellKnownSymbol": {
      return wellKnownSymbolVarName(node.children[0]);
    }
    case "string": {
      return JSON.stringify(node.children[0]);
    }
    case "number": {
      // TODO this is a "mathematical value" according to the spec
      // check if any number referred to in the spec may not be
      // representable as a JS double and then panic a little bit
      // if that's the case.
      return node.children[0];
    }
    case "float": {
      return node.children[0].toString();
    }
    case "bigint": {
      return node.children[0] + "n";
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
    case "hasSlot": {
      const [thing, slot] = node.children;
      return `HAS_SLOT(${s(thing)}, ${s(slot)})`;
    }

    // STATEMENTS
    case "let": {
      return `var ${cleanIdentifier(s(node.children[0]))} = ${s(
        node.children[1]
      )}`;
    }
    case "set": {
      return `${s(node.children[0])} = ${s(node.children[1])}`;
    }
    case "condition": {
      const [cond, ifTrue, elseClause] = node.children;
      return `
        if (${s(cond)}) {
            ${s(ifTrue)}
        }
        ${
          elseClause
            ? `
            else {
              ${s(elseClause.children[0])}
            }
        `
            : ""
        }
      `;
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
    case "assert": {
      return `ASSERT(${s(node.children[0])});`;
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
    case "repeatWhile": {
      const [expr, body] = node.children;
      return `while (${s(expr)}) {
        ${s(body)}
    }`;
    }
    case "else":
    // Else is here because we couldn't join it with the previous if
    // Usually this means the previous if was parsed as "unknown"
    case "unknown": {
      return (
        "UNKNOWN(" +
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
    case "comment": {
      return `/* ${node.children[0].replaceAll(/\*\//g, "*\\/")} */`;
    }
    case "innerBlockHack": {
      throw new Error("Shouldn't be here");
    }
    default: {
      throw new Error(
        `stringifyToJs: Unknown node type ${node && (node as any).ast}`
      );
    }
  }
}

const operators = {
  and: "&&",
  or: "||",
  not: "!",
  equals: "===",
  "-": "-",
  "+": "+",
  "*": "*",
  "/": "/",
  "%": "%",
  "<": "<",
  ">": ">",
  "<=": "<=",
  ">=": ">=",
};

const operator = (op: string): string => {
  if (!(op in operators)) throw new Error(`Unknown operator ${op}`);
  return (operators as any)[op];
};

const slotVarName = (slotName: string) => `slot_${cleanIdentifier(slotName)}`;

const percentVarName = (percentName: string) =>
  `percent_${cleanIdentifier(percentName)}`;

const wellKnownSymbolVarName = (symbolName: string) =>
  `wellKnownSymbol_${cleanIdentifier(symbolName.replace("@@", ""))}`;

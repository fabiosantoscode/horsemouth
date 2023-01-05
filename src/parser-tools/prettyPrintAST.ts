import { AlgorithmNode } from "../parser/parse";

export function prettyPrintAST(astNode: AlgorithmNode | AlgorithmNode[], indentLevel = 0): string {
  const currentIndent = "  ".repeat(indentLevel);
  const nextIndent = "  ".repeat(indentLevel + 1);

  if (Array.isArray(astNode)) {
    return `[\n${astNode.map((node) => nextIndent + prettyPrintAST(node, indentLevel + 1)).join("\n")
      }\n${currentIndent}]`;
  }

  if (typeof astNode === "string") {
    return astNode;
  }

  switch (astNode.ast) {
    case "literal":
      return `lit ${astNode.children[0]}`;
    case "reference":
      return `<${astNode.children[0]}>`;
    case "slotReference":
      return `[[${astNode.children[0]}]]`;
    case 'unaryBooleanExpr':
      const [op, arg] = astNode.children;
      return `(${op} ${prettyPrintAST(arg)})`;
    case 'let':
      const [name, value] = astNode.children;
      return `let ${name.children[0]} = ${prettyPrintAST(value)}`;
    case 'booleanExpr':
      const [op2, left, right] = astNode.children;
      return `(${prettyPrintAST(left)} ${op2} ${prettyPrintAST(right)})`;
    case "list":
      const items = astNode.children.map((child) => prettyPrintAST(child));
      return `(List ${items.join(', ')})`;
    case 'block':
      return `block: ${prettyPrintAST(astNode.children, indentLevel + 1)}`;
    case 'repeat':
      return `repeat: ${prettyPrintAST(astNode.children, indentLevel + 1)}`;
    case 'dottedProperty':
      return astNode.children.map((child) => prettyPrintAST(child)).join(".");
    default:
      return `(${astNode.ast
        } ${astNode.children.map((child) => prettyPrintAST(child)).join(" ")
        })`;
  }
}

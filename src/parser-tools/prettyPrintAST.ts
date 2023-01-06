import { AlgorithmNode } from "../parser/ast";
import { isAlgorithmNode } from "./isAlgorithmNode";

export function prettyPrintAST(
  astNode: AlgorithmNode | AlgorithmNode[] | string | undefined,
  indentLevel = 0
): string {
  const recurse = (node: AlgorithmNode | AlgorithmNode[]) =>
    prettyPrintAST(node, indentLevel);

  const currentIndent = "  ".repeat(indentLevel);
  const nextIndent = "  ".repeat(indentLevel + 1);

  if (Array.isArray(astNode)) {
    return `[\n${astNode
      .map((node) => nextIndent + prettyPrintAST(node, indentLevel + 1))
      .join("\n")}\n${currentIndent}]`;
  }

  if (
    !isAlgorithmNode(astNode) ||
    typeof astNode === "string" ||
    astNode == null
  ) {
    return String(astNode);
  }

  switch (astNode.ast) {
    case "reference":
      return `<${astNode.children[0]}>`;
    case "slotReference":
      return `[[${astNode.children[0]}]]`;
    case "unaryExpr":
      const [op, arg] = astNode.children;
      return `(${op} ${recurse(arg)})`;
    case "let":
      const [name, value] = astNode.children;
      return `let ${name.children[0]} = ${recurse(value)}`;
    case "binaryExpr":
      const [op2, left, right] = astNode.children;
      return `(${recurse(left)} ${op2} ${recurse(right)})`;
    case "list":
      const items = astNode.children.map(recurse);
      return `(List ${items.join(", ")})`;
    case "block":
      return `block: ${recurse(astNode.children)}`;
    case "repeat":
      return `repeat: ${recurse(astNode.children)}`;
    case "dottedProperty":
      return astNode.children.map(recurse).join(".");
    case "condition": {
      const [cond, then, otherwise] = astNode.children;

      if (otherwise && otherwise.ast !== "else") {
        throw new Error(
          "Expected an else clause, got " + JSON.stringify(otherwise)
        );
      }

      const if_ = `(if ` + recurse(cond);
      const then_ =
        "\n" + nextIndent + "then: " + prettyPrintAST(then, indentLevel + 1);
      const else_ =
        otherwise &&
        "\n" +
          nextIndent +
          "else: " +
          prettyPrintAST(otherwise.children[0], indentLevel + 1);
      const endif = "\n" + currentIndent + ")";

      if (else_) return if_ + then_ + else_ + endif;
      else return if_ + then_ + endif;
    }
    default:
      return `(${astNode.ast} ${astNode.children
        .map((child) =>
          isAlgorithmNode(child) ? recurse(child) : String(child)
        )
        .join(" ")})`;
  }
}

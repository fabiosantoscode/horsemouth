const allJsKeywordsAndReservedWords = [
  "abstract",
  "arguments",
  "await",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "import",
  "export",
  "throw",
  "return",
  "delete",
  "new",
  "let",
  "in",
  "var",
  "const",
  "package",
];

export const cleanIdentifier = (id: string) =>
  id
    .trim()
    .replaceAll(/[^a-zA-Z0-9_]+/g, "_")
    .replaceAll(
      new RegExp(`^(${allJsKeywordsAndReservedWords.join("|")})$`, "g"),
      "$1_"
    );

import moo from "moo";
import type { HTMLAlgorithm } from "../html-parsing/findAlgorithms";
import { noSpaceTokenizer } from "../parser-tools/noSpaceTokenizer";

interface AlgorithmArgs {
  argName: string;
  isOptional: boolean;
}

export type AlgorithmUsage =
  | { type: "function"; name: string[]; args: AlgorithmArgs[] }
  | { type: "method"; name: string[]; args: AlgorithmArgs[] }
  | { type: "constructor"; name: string[]; args: AlgorithmArgs[] }
  | { type: "staticMethod"; name: string[]; args: AlgorithmArgs[] }
  | { type: "getter"; name: string[]; args: [] }
  | { type: "setter"; name: string[]; args: AlgorithmArgs[] };

const algorithmHeadTokenizer = noSpaceTokenizer(
  moo.compile({
    word: /[a-zA-Z_$][a-zA-Z0-9_$:.]*/,
    space: / +/,
    comma: ",",
    lParen: "(",
    rParen: ")",
    lBrace: "{",
    rBrace: "}",
    atAt: "@@",
    lSquareBracket: "[",
    rSquareBracket: "]",
    error: moo.error,
  })
);

export function getAlgorithmHead({
  section,
}: Pick<HTMLAlgorithm, "section">): AlgorithmUsage {
  const [headText, headTokens] = h1Tokens(section);

  try {
    const cur = () => headTokens[0];
    const next = () => headTokens.shift();
    const expect = (type: string | undefined) => {
      if (cur()?.type !== type)
        throw new Error("expected " + type + ", got " + cur()?.type);
      return next()!;
    };

    let type: AlgorithmUsage["type"] = "function";
    let rootName = Array.from(
      (function* findNameParts() {
        const firstWord = expect("word").value;

        if (firstWord === "get") {
          type = "getter";
        } else if (firstWord === "set") {
          type = "setter";
        } else {
          yield firstWord;
        }

        while (1) {
          const tok = next();
          if (!tok || tok.type === "lParen") {
            break;
          }

          if (tok.type === "lSquareBracket") {
            expect("atAt");
            yield "@@" + expect("word").value;
            expect("rSquareBracket");
          } else if (tok.type === "dot") {
            // skip the dot
          } else if (tok.type === "word") {
            yield tok.value;
          } else {
            throw new Error("unexpected token " + tok.type);
          }
        }
      })()
    );

    return {
      type,
      name: rootName,
      args: parseArguments(type, expect, cur),
    } as AlgorithmUsage;
  } catch (error) {
    console.log(headText);
    console.log(headTokens);
    throw error;
  }
}

function parseArguments(
  type: AlgorithmUsage["type"],
  expect: (type?: string) => moo.Token,
  cur: () => moo.Token
) {
  if (type === "getter" || type === "setter") {
    expect(undefined);
    return [];
  }

  const args: AlgorithmArgs[] = [];

  while (cur() && cur().type !== "rParen") {
    const isOptional = cur().type === "lSquareBracket";
    if (isOptional) expect("lSquareBracket");

    // ( regular_arg[ , optional_arg] )
    if (cur().type === "comma") expect("comma");

    const argName = expect("word").value;

    args.push({
      argName,
      isOptional,
    });

    if (isOptional) expect("rSquareBracket");

    // ( regular_arg, [optional_arg] )
    if (cur().type === "comma") expect("comma");
  }

  expect("rParen");

  return args;
}

function h1Tokens(section: Element) {
  section.querySelector(".secnum")?.remove();

  let header: Element | null = section;
  if (section.tagName !== "H1") {
    header = section.querySelector("h1");
  }
  if (!header) {
    throw new Error("could not find algorithm <h1> in " + section.outerHTML);
  }
  const headTokens = [
    ...algorithmHeadTokenizer.reset(header.textContent?.toLocaleLowerCase()),
  ];

  return [header.textContent, headTokens] as const;
}

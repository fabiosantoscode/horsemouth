import moo from "moo";
import type { HTMLAlgorithm } from "../html-parsing/findAlgorithms";
import { noSpaceTokenizer } from "../parser-tools/noSpaceTokenizer";
import { getDefined } from "../utils/getDefined";

interface AlgorithmArgs {
  argName: string;
  isOptional: boolean;
  isVarArgs: boolean;
}

export type AlgorithmUsage =
  | { type: "function"; name: string[]; args: AlgorithmArgs[] }
  | { type: "method"; name: string[]; args: AlgorithmArgs[] }
  | { type: "constructor"; name: string[]; args: AlgorithmArgs[] }
  | { type: "staticMethod"; name: string[]; args: AlgorithmArgs[] }
  | { type: "getter"; name: string[]; args: [] }
  | { type: "setter"; name: string[]; args: AlgorithmArgs[] };

const ellipsis = "…";

const algorithmHeadTokenizer = noSpaceTokenizer(
  moo.compile({
    word: /[a-zA-Z_$][a-zA-Z0-9_$:]*/,
    intrinsic: /%[a-zA-Z_$][a-zA-Z0-9_$:.]*%/,
    space: / +/,
    comma: ",",
    dot: ".",
    lParen: "(",
    rParen: ")",
    lBrace: "{",
    rBrace: "}",
    ellipsis,
    atAt: "@@",
    lSquareBracket: "[",
    rSquareBracket: "]",
    error: moo.error,
  })
);

export function getAlgorithmHead({
  section,
}: Pick<HTMLAlgorithm, "section">): AlgorithmUsage {
  const [headText, headTokens] = h1Tokens(section, (unfiltered) =>
    unfiltered
      // "p1, p2, … , pn" is found in the head of some algorithms
      .replace(/p1\s*,\s*p2\s*,\s*…\s*,\s*pn/, "…p")
  );

  try {
    const cur = () => headTokens[0];
    const next = () => headTokens.shift();
    const expect = (type: string | undefined) => {
      if (cur()?.type !== type)
        throw new Error("expected " + type + ", got " + cur()?.type);
      return next()!;
    };

    let type: AlgorithmUsage["type"] = "function";
    let funcName = Array.from(
      (function* findNameParts() {
        const firstWord = cur().value;

        if (firstWord === "get") {
          type = "getter";
          next();
        } else if (firstWord === "set") {
          type = "setter";
          next();
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
          } else if (tok.type === "word" || tok.type === "intrinsic") {
            yield tok.value;
          } else {
            throw new Error("unexpected token " + tok.type);
          }
        }
      })()
    );

    return {
      type,
      name: funcName.map((upperName) => upperName.toLocaleLowerCase()),
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

  let inBrackets = 0;
  const args: AlgorithmArgs[] = [];

  while (cur() && cur().type !== "rParen") {
    // Close square brackets, commas
    while (cur().type === "lSquareBracket" || cur().type === "comma") {
      if (cur().type === "lSquareBracket") {
        inBrackets++;
        expect("lSquareBracket");
      } else {
        expect("comma");
      }
    }

    const isVarArgs = cur().type === "ellipsis";
    if (isVarArgs) expect("ellipsis");

    const argName = expect("word").value.toLocaleLowerCase();

    args.push({
      argName,
      isOptional: inBrackets > 0,
      isVarArgs,
    });

    // Close square brackets, commas
    while (cur().type === "rSquareBracket" || cur().type === "comma") {
      if (cur().type === "rSquareBracket") {
        inBrackets--;
        expect("rSquareBracket");
      } else {
        expect("comma");
      }
    }
  }

  expect("rParen");

  return args;
}

function h1Tokens(section: Element, filter = (s: string) => s) {
  section.querySelector(".secnum")?.remove();

  let header: Element | null = section;
  if (section.tagName !== "H1") {
    header = section.querySelector("h1");
  }
  if (!header) {
    throw new Error("could not find algorithm <h1> in " + section.outerHTML);
  }
  const headTokens = [
    ...algorithmHeadTokenizer.reset(filter(getDefined(header.textContent))),
  ];

  return [header.textContent, headTokens] as const;
}

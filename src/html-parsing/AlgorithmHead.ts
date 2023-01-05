import moo from "moo";
import type { HTMLAlgorithm } from "../html-parsing/findAlgorithms";
import { getDefined } from "../utils/getDefined";
import {noSpaceTokenizer} from '../parser-tools/noSpaceTokenizer';

interface AlgorithmArgs {
  argName: string;
  isOptional: boolean;
}

type AlgorithmUsage =
  | { type: "function"; name: string; args: AlgorithmArgs[] }
  | { type: "method"; name: string; args: AlgorithmArgs[] };

  const algorithmHeadTokenizer = noSpaceTokenizer(moo.compile({
    word: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    space: / +/,
    comma: ",",
    lParen: "(",
    rParen: ")",
    lBrace: "{",
    rBrace: "}",
    lSquareBracket: "[",
    rSquareBracket: "]",
  }));

export function getAlgorithmHead({ section }: HTMLAlgorithm): AlgorithmUsage {
  section.querySelector(".secnum")?.remove();

  const headTokens = [...algorithmHeadTokenizer.reset(section.textContent!)];

  const cur = () => headTokens[0];
  const next = () => headTokens.shift();
  const expect = (type: string) => {
    if (cur().type !== type)
      throw new Error("expected " + type + ", got " + cur().type);
    return next()!;
  };

  const rootName = getDefined(expect("word")).value;

  expect("lParen");

  const usage: AlgorithmUsage = {
    type: "function",
    name: rootName,
    args: [],
  };

  while (cur() && cur().type !== "rParen") {
    const isOptional = cur().type === "lSquareBracket";
    if (isOptional) expect("lSquareBracket");

    const argName = expect("identifier").value;

    usage.args.push({
      argName,
      isOptional,
    });

    if (isOptional) expect("rSquareBracket");

    if (cur().type === "comma") expect("comma");
  }

  expect("rParen");

  return usage;
}

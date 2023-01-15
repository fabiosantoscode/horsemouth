import { AlgorithmNode } from "./ast";
import { algorithmTokenizer } from "./tokenizer";

// Shoddily match expressions like Assert : ...
export function shoddyParse(sourceCode: string): AlgorithmNode | undefined {
  const basicTokens = [
    ...algorithmTokenizer.reset(
      sourceCode.toLocaleLowerCase().trimEnd().replace(/\.$/, "")
    ),
  ].join(" ");

  let matches: string[] = [];
  const attempt = (re: RegExp) => {
    matches = (basicTokens.match(re) || []).slice(1);
    if (matches.length) return true;
  };

  switch (true) {
    case attempt(/^assert : (.+)/): {
      return {
        ast: "assert",
        children: [{ ast: "unknown", children: [matches[0]] }],
      };
    }
    case attempt(/^return (.+)/): {
      return {
        ast: "return_",
        children: [{ ast: "unknown", children: [matches[0]] }],
      };
    }
    case attempt(/^throw (.+)/): {
      return {
        ast: "throw_",
        children: [{ ast: "unknown", children: [matches[0]] }],
      };
    }

    default: {
      return undefined;
    }
  }
}

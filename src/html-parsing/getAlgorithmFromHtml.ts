import assert from "assert";
import { getInnerBlockHack } from "../parser/tokenizer";
import { cleanIdentifier } from "../utils/cleanIdentifier";
import { getOnly } from "../utils/getOnly";
import { isHtmlTag } from "./htmlUtils";
import { HTMLAlgorithm } from "./findAlgorithms";
import { AlgorithmUsage, getAlgorithmHead } from "./AlgorithmHead";

export interface AlgorithmBlockFromHtml {
  usage?: AlgorithmUsage;
  steps: AlgorithmStepFromHtml[];
}
export type AlgorithmStepFromHtml = {
  sourceText: string;
  blockReferences: AlgorithmBlockFromHtml[];
};

let errors = 0;
setTimeout(() => {
  if (errors && typeof globalThis.describe === "undefined")
    console.log("algorithm head errors", errors);
  errors = 0;
});
export const getAlgorithmBlockFromHtml = (
  node: Element | HTMLAlgorithm | AlgorithmBlockFromHtml | string[]
): AlgorithmBlockFromHtml => {
  // for testing
  if (Array.isArray(node)) {
    return {
      steps: node.map((s) => ({
        sourceText: s,
        blockReferences: [],
      })),
    };
  }

  if ((node as AlgorithmBlockFromHtml).steps)
    return node as AlgorithmBlockFromHtml;

  let usage: AlgorithmUsage | undefined;
  let algorithmNode: Element;

  if ((node as any).algorithm) {
    algorithmNode = (node as HTMLAlgorithm).algorithm;
    try {
      usage = getAlgorithmHead(node as HTMLAlgorithm);
    } catch (e) {
      errors++;
      console.log("error getting algorithm head", e);
      console.log("at ", (node as HTMLAlgorithm).algorithm.outerHTML);
    }
  } else {
    algorithmNode = node as Element;
  }

  if (isHtmlTag(algorithmNode, "EMU-ALG")) {
    algorithmNode = getOnly(algorithmNode.children);
  }

  assert.equal(
    algorithmNode.tagName,
    "OL",
    "algorithm blocks are <OL> elements"
  );

  const steps = [...algorithmNode.children].flatMap((child) => {
    if (child.tagName === "LI") {
      return [getAlgorithmStepFromHtml(child)];
    }
    if (child.tagName) {
      throw new Error(`Unexpected tag ${child.tagName} in algorithm block`);
    }
    return [];
  });

  return { usage, steps };
};

export const getAlgorithmStepFromHtml = (
  node: Element | AlgorithmStepFromHtml | string
): AlgorithmStepFromHtml => {
  // for testing
  if (typeof node === "string") {
    return { sourceText: node, blockReferences: [] };
  }

  if ((node as any).blockReferences) return node as AlgorithmStepFromHtml;

  assert.equal(
    (node as any).tagName,
    "LI",
    "algorithm steps are <li> elements"
  );

  const blockReferences: AlgorithmBlockFromHtml[] = [];
  const sourceText = ([...(node as Element).childNodes] as Element[])
    .flatMap((child): string[] => {
      if (child.tagName && child.getAttribute("aria-hidden")) {
        // Steps are numbered with little spans. Assume everything aria-hidden is irrelevant
        return [];
      }
      if (child.tagName === "OL") {
        const childBlock = getAlgorithmBlockFromHtml(child as HTMLOListElement);
        blockReferences.push(childBlock);
        return [getInnerBlockHack(blockReferences.length - 1)];
      }
      if (child.tagName === "EMU-XREF" && child.getAttribute("aoid")) {
        return [cleanIdentifier(child.getAttribute("aoid") || "")];
      } else {
        const text = child.textContent?.trim();
        return text ? [text] : [];
      }
    })
    .join(" ");

  return { sourceText, blockReferences };
};

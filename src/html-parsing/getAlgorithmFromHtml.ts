import assert from "assert";
import { getInnerBlockHack } from "../parser/tokenizer";
import { cleanIdentifier } from "../utils/cleanIdentifier";
import { getOnly } from "../utils/getOnly";
import { isHtmlTag } from "./htmlUtils";

export interface AlgorithmBlockFromHtml {
  steps: AlgorithmStepFromHtml[];
}
export type AlgorithmStepFromHtml = {
  sourceText: string;
  blockReferences: AlgorithmBlockFromHtml[];
};

export const getAlgorithmBlockFromHtml = (
  node: Element | AlgorithmBlockFromHtml
): AlgorithmBlockFromHtml => {
  // for testing
  if ((node as AlgorithmBlockFromHtml).steps) return node as AlgorithmBlockFromHtml;

  if (isHtmlTag(node, "EMU-ALG")) {
    node = getOnly(node.children)
  }

  assert.equal(
    (node as any).tagName,
    "OL",
    "algorithm blocks are <OL> elements"
  );

  const steps = [...(node as HTMLOListElement).children].flatMap((child) => {
    if (child.tagName === "LI") {
      return [getAlgorithmStepFromHtml(child)];
    }
    if (child.tagName) {
      throw new Error(`Unexpected tag ${child.tagName} in algorithm block`);
    }
    return [];
  });

  return { steps };
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
        const text = child.textContent?.trim()
        return text ? [text] : []
      }
    })
    .join(" ");

  return { sourceText, blockReferences };
};

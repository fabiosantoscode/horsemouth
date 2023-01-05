import assert from "assert";
import { HTMLElement, HTMLOListElement } from "linkedom";
import { getInnerBlockHack } from "./tokenizer";
import { cleanIdentifier } from "../utils/cleanIdentifier";

export type AlgorithmStepFromHtml = {
  sourceText: string;
  blockReferences: AlgorithmStepFromHtml[][];
};

export const getAlgorithmBlockFromHtml = (
  node: HTMLElement
): AlgorithmStepFromHtml[] => {
  assert.equal(
    (node as any).tagName,
    "OL",
    "algorithm blocks are <OL> elements"
  );

  return [...(node as HTMLOListElement).childNodes].flatMap((child) => {
    if (child.tagName === "LI") {
      return [getAlgorithmStepFromHtml(child as HTMLElement)];
    }
    if (child.tagName) {
      throw new Error(`Unexpected tag ${child.tagName} in algorithm block`);
    }
    return [];
  });
};

export const getAlgorithmStepFromHtml = (
  node: HTMLElement | AlgorithmStepFromHtml | string
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

  const blockReferences: AlgorithmStepFromHtml[][] = [];
  const sourceText = [...(node as HTMLElement).childNodes]
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
        return [child.textContent.trim()];
      }
    })
    .join(" ");

  return { sourceText, blockReferences };
};

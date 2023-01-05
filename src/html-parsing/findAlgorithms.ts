import assert from "assert";

export interface HTMLAlgorithm {
  section: Element;
  algorithm: Element;
}

export function findAlgorithms(
  clauses: Element | Element[]
): HTMLAlgorithm[] {
  return [clauses].flat().flatMap((clause) => {
    const algChildren = [...clause.children].filter(
      (child) => child.tagName === "EMU-ALG"
    );

    assert(algChildren.length < 2, `more than one alg found in ${clause.id}`);

    return algChildren.map((alg) => ({
      section: clause,
      algorithm: alg,
    }));
  });
}

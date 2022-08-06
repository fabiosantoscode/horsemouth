import assert from "assert"
import { HTMLElement } from "linkedom"
import { Algorithm } from "../parser/parse"

export interface HTMLAlgorithm {
  section: HTMLElement
  algorithm: HTMLElement
}

export function findAlgorithms(clauses: HTMLElement | HTMLElement[]): HTMLAlgorithm[] {
  return [clauses].flat().flatMap(clause =>{
  const algChildren = clause.children.filter(child => child.tagName === 'EMU-ALG')

  assert(algChildren.length < 2, `more than one alg found in ${clause.id}`)

  return algChildren.map(alg => ({
    section: clause,
    algorithm: alg
  }))})
}

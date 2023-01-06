// Test that we can parse the head of the algorithm

import { parseHTML } from "linkedom";
import { getAlgorithmHead } from "./AlgorithmHead";

it("can parse a function", () => {
  expect(testHeader("foo(bar)")).toMatchInlineSnapshot(`"function foo(bar)"`);
  expect(testHeader("foo(bar, [baz])")).toMatchInlineSnapshot(
    `"function foo(bar, baz?)"`
  );
  expect(testHeader("foo()")).toMatchInlineSnapshot(`"function foo()"`);
});

it("can parse varargs", () => {
  expect(
    testHeader("AsyncFunction ( p1, p2, … , pn, body )")
  ).toMatchInlineSnapshot(`"function asyncfunction(...p, body)"`);
});

it("can parse optional arguments", () => {
  expect(
    testHeader("ToPrimitive ( input [ , preferredType ] )")
  ).toMatchInlineSnapshot(`"function toprimitive(input, preferredtype?)"`);
});

it("can parse a getter", () => {
  const parsed = testHeader("get RegExp.prototype.sticky");

  expect(parsed).toMatchInlineSnapshot(`"getter regexp.prototype.sticky()"`);
});

it("can parse a method", () => {
  const parsed = testHeader("RegExp.prototype.foo(bar)");

  expect(parsed).toMatchInlineSnapshot(`"function regexp.prototype.foo(bar)"`);
});

it("can parse names with @@-references", () => {
  const parsed = testHeader("RegExp.prototype[@@match](string, [position])");

  expect(parsed).toMatchInlineSnapshot(
    `"function regexp.prototype,@@match(string, position?)"`
  );
});

const testHeader = (header: string) => {
  const { document } = parseHTML(`<h1>${header}</h1>`);

  const { type, name, args } = getAlgorithmHead({
    section: document.querySelector("h1")!,
  });

  return `${type} ${name}(${args
    .map(({ isOptional, isVarArgs, argName }) =>
      isVarArgs ? `...${argName}` : isOptional ? `${argName}?` : argName
    )
    .join(", ")})`;
};

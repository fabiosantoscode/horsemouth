// Test that we can parse the head of the algorithm

import { parseHTML } from "linkedom";
import { getAlgorithmHead } from "./AlgorithmHead";

it("can parse a function", () => {
  expect(testHeader("foo(bar)")).toMatchInlineSnapshot(
    `"function foo ( bar )"`
  );
  expect(testHeader("foo(bar, [baz])")).toMatchInlineSnapshot(
    `"function foo ( bar , baz? )"`
  );
  expect(testHeader("foo()")).toMatchInlineSnapshot(`"function foo (  )"`);
});

it("can parse varargs", () => {
  expect(
    testHeader("AsyncFunction ( p1, p2, … , pn, body )")
  ).toMatchInlineSnapshot(`"function asyncfunction ( ...p , body )"`);
});

it("can parse optional arguments", () => {
  expect(
    testHeader("ToPrimitive ( input [ , preferredType ] )")
  ).toMatchInlineSnapshot(`"function toprimitive ( input , preferredtype? )"`);

  expect(
    testHeader("JSON.stringify ( value [ , replacer [ , space ] ] )")
  ).toMatchInlineSnapshot(
    `"function json . stringify ( value , replacer? , space? )"`
  );
});

it("can parse names involving well known intrinsics", () => {
  expect(
    testHeader("%IteratorPrototype% [ @@iterator ] ( )")
  ).toMatchInlineSnapshot(`"function %iteratorprototype% . @@iterator (  )"`);
});

it("can parse a getter", () => {
  const parsed = testHeader("get RegExp.prototype.sticky");

  expect(parsed).toMatchInlineSnapshot(
    `"getter regexp . prototype . sticky (  )"`
  );
});

it("can parse a method", () => {
  const parsed = testHeader("RegExp.prototype.foo(bar)");

  expect(parsed).toMatchInlineSnapshot(
    `"function regexp . prototype . foo ( bar )"`
  );
});

it("can parse things called Get and Set", () => {
  const parsed = testHeader("Get()");
  expect(parsed).toMatchInlineSnapshot(`"function get (  )"`);

  const parsed2 = testHeader("Set.prototype.add(value)");
  expect(parsed2).toMatchInlineSnapshot(
    `"function set . prototype . add ( value )"`
  );

  const parsed3 = testHeader("get Set.prototype.size");
  expect(parsed3).toMatchInlineSnapshot(`"getter set . prototype . size (  )"`);
});

it("can parse names with @@-references", () => {
  const parsed = testHeader("RegExp.prototype[@@match](string, [position])");

  expect(parsed).toMatchInlineSnapshot(
    `"function regexp . prototype . @@match ( string , position? )"`
  );
});

const testHeader = (header: string) => {
  const { document } = parseHTML(`<h1>${header}</h1>`);

  const { type, name, args } = getAlgorithmHead({
    section: document.querySelector("h1")!,
  });

  return `${type} ${name.join(" . ")} ( ${args
    .map(({ isOptional, isVarArgs, argName }) =>
      isVarArgs ? `...${argName}` : isOptional ? `${argName}?` : argName
    )
    .join(" , ")} )`;
};

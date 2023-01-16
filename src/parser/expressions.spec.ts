import { parseAlgorithmStep } from "./parse";

const testExpression = (expr: string) => {
  const step = parseAlgorithmStep(`return ${expr} .`);
  if (step.ast === "return_") {
    return step.children[0];
  }
  return step;
};

it("can parse typechecks", () => {
  expect(
    testExpression("the Record { [[Type]] } that is y")
  ).toMatchInlineSnapshot(`(typeCheck (string some record?) <y>)`);
});

describe("math", () => {
  it("can parse modulo ops", () => {
    expect(testExpression("𝔽 ( int modulo 2 )")).toMatchInlineSnapshot(
      `(call <𝔽> (<int> % (number 2)))`
    );
    expect(testExpression("int modulo 2 ** 16")).toMatchInlineSnapshot(
      `(<int> % ((number 2) ** (number 16)))`
    );

    expect(
      testExpression("ℝ ( bigint ) modulo 2 ** bits")
    ).toMatchInlineSnapshot(`((call <ℝ> <bigint>) % ((number 2) ** <bits>))`);
  });

  it("can parse parentheticals", () => {
    expect(testExpression("var modulo (x + 10)")).toMatchInlineSnapshot(
      `(<var> % (<x> + (number 10)))`
    );
  });

  it("can be mixed up", () => {
    expect(testExpression("( a × b ) modulo 2 * * 32")).toMatchInlineSnapshot(
      `((<a> * <b>) % ((number 2) ** (number 32)))`
    );
  });
});

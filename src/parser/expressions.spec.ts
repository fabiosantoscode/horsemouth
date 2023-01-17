import { parseAlgorithmStep } from "./parse";

const testExpression = (expr: string) => {
  const step = parseAlgorithmStep(`return ${expr} .`, {
    allowUnknown: false,
  });
  if (step.ast === "return_") {
    return step.children[0];
  }
  return step;
};

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

  it("can parse hex", () => {
    expect(testExpression("0x1234")).toMatchInlineSnapshot(`(number 4660)`);
  });

  it("can clamp", () => {
    expect(
      testExpression("the result of clamping intEnd between 0 and len")
    ).toMatchInlineSnapshot(`(call <CLAMP> <intend> (number 0) <len>)`);
  });
});

it("can parse comparisons", () => {
  expect(
    testExpression(
      "IsDataDescriptor ( current ) and IsDataDescriptor ( Desc ) are both true"
    )
  ).toMatchInlineSnapshot(
    `(((call <isdatadescriptor> <current>) equals <true>) and ((call <isdatadescriptor> <desc>) equals <true>))`
  );
});

describe("types", () => {
  it("can parse typechecks", () => {
    expect(
      testExpression("the Record { [[Type]] } that is y")
    ).toMatchInlineSnapshot(`(typeCheck (string some record?) <y>)`);

    expect(
      testExpression("the String value of O . [[ TypedArrayName ]]")
    ).toMatchInlineSnapshot(
      `(typeCheck (string some record?) <o>.[[typedarrayname]])`
    );
  });

  it("is a", () => {
    expect(testExpression("x is a Module Record")).toMatchInlineSnapshot(
      `(call <HAS_TYPE> <x> (string some record?))`
    );
  });

  it("are the same Y", () => {
    expect(
      testExpression("requiredModule and module are the same Module Record")
    ).toMatchInlineSnapshot(
      `((call <HAS_TYPE> <requiredmodule> (string some record?)) and ((call <HAS_TYPE> <module> (string some record?)) and (<requiredmodule> equals <module>)))`
    );
  });
});

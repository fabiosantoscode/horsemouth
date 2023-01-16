import { parseAlgorithmStep } from "./parse";

it("can parse typechecks", () => {
  expect(
    parseAlgorithmStep("Let x be the Record { [[Type]] } that is y.")
  ).toMatchInlineSnapshot(`let x = (typeCheck (string some record?) <y>)`);
});

describe("math", () => {
  it("can parse modulo ops", () => {
    expect(
      parseAlgorithmStep("return 𝔽 ( int modulo 2 ) .")
    ).toMatchInlineSnapshot(`(return_ (call <𝔽> (<int> % (number 2))))`);
    expect(
      parseAlgorithmStep("Let int16bit be int modulo 2 ** 16 .")
    ).toMatchInlineSnapshot(
      `let int16bit = (<int> % ((number 2) ** (number 16)))`
    );

    expect(
      parseAlgorithmStep("Let mod be ℝ ( bigint ) modulo 2 ** bits .")
    ).toMatchInlineSnapshot(
      `let mod = ((call <ℝ> <bigint>) % ((number 2) ** <bits>))`
    );
  });
});

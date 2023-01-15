import "../experiments";
import { parseAlgorithmStep } from "./parse";

it("parse step using grammar", () => {
  expect(
    parseAlgorithmStep(
      "If NewTarget is undefined, throw a TypeError exception."
    )
  ).toMatchInlineSnapshot(`
    (if (<newtarget> equals <undefined>)
      then: (throw_ <typeerror>)
    )
  `);
});

it("can parse variable assignments", () => {
  expect(
    parseAlgorithmStep("Let capN be ? Get ( result , ! ToString ( 𝔽 ( n ))).")
  ).toMatchInlineSnapshot(
    `let capn = (call <get> <result> (call <tostring> (call <𝔽> <n>)))`
  );
});

it("can parse some math", () => {
  expect(parseAlgorithmStep("set k to k + 1.")).toMatchInlineSnapshot(
    `(set <k> (<k> + (number 1)))`
  );
  expect(parseAlgorithmStep('if k is 1, then return "one".'))
    .toMatchInlineSnapshot(`
    (if (<k> equals (number 1))
      then: (return_ (string one))
    )
  `);
});

it("can parse comparisons", () => {
  expect(
    parseAlgorithmStep({
      sourceText: "Repeat, while n ≤ nCaptures , :::innerblockhack0",
      blockReferences: [
        {
          steps: [{ sourceText: "Perform UwU() .", blockReferences: [] }],
        },
      ],
    })
  ).toMatchInlineSnapshot(`
    (repeatWhile (<n> <= <ncaptures>) block: [
      (call <uwu>)
    ])
  `);
});

it("can parse symbol refs", () => {
  expect(
    parseAlgorithmStep("Let S be ? Get ( C , @@species ).")
  ).toMatchInlineSnapshot(
    `let s = (call <get> <c> (wellKnownSymbol @@species))`
  );
});

it("can parse chained comparisons", () => {
  expect(parseAlgorithmStep("if x is 1, 2, or 3, then return true."))
    .toMatchInlineSnapshot(`
    (if ((<x> equals (number 1)) or ((<x> equals (number 2)) or (<x> equals (number 3))))
      then: (return_ <true>)
    )
  `);
  expect(
    parseAlgorithmStep("If n is NaN , n is +0 𝔽 , or n is -∞ 𝔽 , return n .")
  ).toMatchInlineSnapshot(`
    (if ((<n> equals <nan>) or ((<n> equals (+ (float 0))) or (<n> equals (- (float Infinity)))))
      then: (return_ <n>)
    )
  `);
});

it("can parse conditions", () => {
  expect(
    parseAlgorithmStep(
      'If SameValue ( R , %RegExp.prototype% ) is true , return "(?:)" .'
    )
  ).toMatchInlineSnapshot(`
    (if ((call <samevalue> <r> (percentReference regexp.prototype)) equals <true>)
      then: (return_ (string (?:)))
    )
  `);
});

it("can parse calls", () => {
  expect(
    parseAlgorithmStep("Let R be ? RegExpCreate ( P , F , newTarget ).")
  ).toMatchInlineSnapshot(`let r = (call <regexpcreate> <p> <f> <newtarget>)`);
  expect(
    parseAlgorithmStep("Return BigInt::equal( x , y ).")
  ).toMatchInlineSnapshot(`(return_ (call <bigint::equal> <x> <y>))`);
});

it("works with internal slots", () => {
  expect(
    parseAlgorithmStep(
      "If R does not have an [[ OriginalFlags ]] internal slot , return 0"
    )
  ).toMatchInlineSnapshot(`
    (if (not (hasSlot <r> [[originalflags]]))
      then: (return_ (number 0))
    )
  `);
});

it("can compare to the empty string", () => {
  expect(
    parseAlgorithmStep("let A be matchStr is the empty String")
  ).toMatchInlineSnapshot(`let a = (<matchstr> equals (string ))`);
});

it("can parse numbers", () => {
  expect(parseAlgorithmStep("let A be - ∞ 𝔽")).toMatchInlineSnapshot(
    `let a = (- (float Infinity))`
  );
  expect(parseAlgorithmStep("let A be - 0 𝔽")).toMatchInlineSnapshot(
    `let a = (- (float 0))`
  );
  expect(parseAlgorithmStep("let A be NaN")).toMatchInlineSnapshot(
    `let a = <nan>`
  );
});

it("parses string operations", () => {
  expect(
    parseAlgorithmStep("Return the code unit 0x0020 (SPACE) .")
  ).toMatchInlineSnapshot(`(return_ (string  ))`);

  expect(
    parseAlgorithmStep(
      "Return the string-concatenation of name , the code unit 0x003A (COLON), the code unit 0x0020 (SPACE), and msg ."
    )
  ).toMatchInlineSnapshot(
    `(return_ (<name> + ((string :) + ((string  ) + <msg>))))`
  );
});

it("falls back to a shoddy parse", () => {
  expect(
    parseAlgorithmStep("Assert : potatoes tomatoes UwU unparsable")
  ).toMatchInlineSnapshot(
    `(assert (unknown potatoes tomatoes uwu unparsable))`
  );
  expect(
    parseAlgorithmStep("Return potatoes tomatoes UwU unparsable")
  ).toMatchInlineSnapshot(
    `(return_ (unknown potatoes tomatoes uwu unparsable))`
  );
  expect(
    parseAlgorithmStep("Throw potatoes tomatoes UwU unparsable")
  ).toMatchInlineSnapshot(
    `(throw_ (unknown potatoes tomatoes uwu unparsable))`
  );
});

# horsemouth
the ES spec impl straight from the horse's mouth (?)

## What

So anyway I was reading the ECMAScript spec and noticed a lot of repeated patterns. Algorithms are always in `<emu-alg>` tags, expressed in neatly structured OL an LI HTML elements. Additionally, calculations are in a pretty well defined syntax, and comparisons use very similar verbiage.

Computer language nerd that I am, I decided to look into it, and a few weeks of work later I was parsing the entire spec.

Running `src/test-sections/try-all.ts` with ts-node generates a JS file stringified.js containing our functions. They look like this

```js
/** @see https://262.ecma-international.org/12.0/#sec-touint32 */
function ToUint32(argument) {
  /** Let number be ? ToNumber ( argument ). */
  var number = tonumber(argument);

  /** If number is NaN , +0 𝔽 , -0 𝔽 , +∞ 𝔽 , or -∞ 𝔽 , return +0 𝔽 . */

  if (
    number === nan ||
    number === +0 ||
    number === -0 ||
    number === +Infinity ||
    number === -Infinity
  ) {
    return +0;
  }

  UNKNOWN(
    "Let int be the mathematical value that is the same sign as number and whose magnitude is floor ( abs ( ℝ ( number ) ) ) ."
  );

  /** Let int32bit be int modulo 2 ** 32 . */
  var int32bit = int % 2 ** 32;

  /** Return 𝔽 ( int32bit ). */
  return AS_FLOAT(int32bit);
}
```

Around 50% of the spec's emu-alg tags are parsable without "unknown" AST nodes. 

# How

Check the `src/test-sections/try-all.ts` file. It's a bit messy but you can see some structure. First it grabs all the `<emu-clause>` elements from the HTML spec file. Then it pre-parses them into a super-simple structure that abstracts away all HTML and uses plain JS objects to represent blocks, their steps, and any nested blocks thereof.

I used the [https://www.npmjs.com/package/nearley](nearley) package to parse each step here, finding anything machine-readable.

The nearley step generates an AST. After some light massaging (for instance, joining "if" steps with "otherwise" steps in the next line to create if-else) we have a big breakdown containing calls, binary operations, return, throw, etc.

And also "unknown" nodes. These are generated when my nearley parser didn't understand a step.

Given the AST, a big switch case in `src/stringify/stringifyToJs.ts` can generate each node in JS. It's possible at least in theory to generate other languages from this, but no type information is generated, so the set of languages we could generate is limited.

# Why

For fun. And it was fun

# What now

I learned a lot, and I'm going to move on.

There's a very strict diminishing returns mechanic going on here. It was pretty easy to get this architecture to generate 30% of all spec-described algorithms without resorting to `UNKNOWN(...)` nodes. It was a bit harder, but doable, to get to 40%. And REALLY hard to get to 54%. This is because while the patterns I did find are really common, they were really not the long tail of very specific phrasing, or one-offs, that comprise this spec.

Anyway I like to do these insane projects, so I'm happy with how it turned out.

If I ever come back to this project, I would look into sentence structure instead of specific operations. It's very ambitious to go straight from annotated english text into an AST that can be translated to code. But using some NLP algorithm for [sentence structure](https://stanfordnlp.github.io/stanza/constituency.html), and accepting some ambiguity, it could be possible for the `sentence structure --> AST` transform to be easier to write.

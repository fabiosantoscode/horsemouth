import { getAlgorithmStepFromHtml } from "./getAlgorithmFromHtml";
import { parseHTML } from "linkedom";

it("turns <sup> into pow", () => {
  expect(
    getAlgorithmStepFromHtml(
      parseHTML(`
        <li><span aria-hidden="true">4. </span><span aria-hidden="true">4. </span>Let <var>int16bit</var> be <var>int</var> <emu-xref aoid="modulo" id="_ref_1983"><a href="#eqn-modulo">modulo</a></emu-xref> 2<sup>16</sup>.</li>
      `).document.querySelector("li") as Element
    )
  ).toMatchInlineSnapshot(`
    {
      "blockReferences": [],
      "sourceText": "Let int16bit be int modulo 2 ** 16 .",
    }
  `);
});

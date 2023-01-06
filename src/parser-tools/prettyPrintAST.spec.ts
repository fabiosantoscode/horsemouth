import { prettyPrintAST } from "./prettyPrintAST";

it("prints nested structures", () => {
  expect(
    prettyPrintAST({
      ast: "block",
      children: [
        {
          ast: "block",
          children: [
            {
              ast: "block",
              children: [],
            },
          ],
        },
      ],
    })
  ).toMatchInlineSnapshot(`
    "block: [
      block: [
        block: [

        ]
      ]
    ]"
  `);

  expect(
    prettyPrintAST({
      ast: "block",
      children: [
        {
          ast: "condition",
          children: [
            {
              ast: "number",
              children: ["10"],
            },

            {
              ast: "block",
              children: [
                {
                  ast: "number",
                  children: ["10"],
                },
              ],
            },
          ],
        },
      ],
    })
  ).toMatchInlineSnapshot(`
    "block: [
      (if (number 10)
        then: block: [
          (number 10)
        ]
      )
    ]"
  `);
});

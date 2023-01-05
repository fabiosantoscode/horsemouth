import { readFileSync, writeFileSync } from "fs";
import { HTMLElement, parseHTML, Element, Text } from "linkedom";
import { HTMLDocument } from "linkedom/types/html/document";

Element.prototype[Symbol.for("nodejs.util.inspect.custom")] = function () {
  return `<${this.tagName.toLowerCase()} ${(this.attributes as any)
    .map((attr: any) => `${attr.name}="${attr.value}"`)
    .join(" ")}>`;
};

Text.prototype[Symbol.for("nodejs.util.inspect.custom")] = function () {
  return `«${this.textContent}»`;
};

export function main() {
  const document = getTopLevel();

  writeFileSync(
    __dirname + "/sections/keyed-collections.html",
    document.find((tag) => tag.id === "sec-keyed-collections")!.outerHTML
  );
}

const getTopLevel = () => {
  const { document } = parseHTML(
    readFileSync(__dirname + "/../ecma262.html", "utf8")
  );

  const children = [
    ...(document as HTMLDocument).querySelector("#spec-container").children,
  ].filter((child) => child.tagName.startsWith("EMU-"));

  return children as HTMLElement[];
};

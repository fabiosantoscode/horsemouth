import { readFileSync, writeFileSync } from "fs";
import { parseHTML, Element, Text } from "linkedom";

Element.prototype[Symbol.for("nodejs.util.inspect.custom")] = function () {
  return `<${this.tagName.toLowerCase()} ${(this.attributes as any)
    .map((attr: any) => `${attr.name}="${attr.value}"`)
    .join(" ")}>`;
};

Text.prototype[Symbol.for("nodejs.util.inspect.custom")] = function () {
  return `«${this.textContent}»`;
};

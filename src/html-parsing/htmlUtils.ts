
export const isHtmlTag = <T extends string>(node: any, tagname: T): node is HTMLElement & { tagName: T } => {
  return Boolean((node) && node.tagName === tagname);
}

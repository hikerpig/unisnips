export type XMLAttribute = {
  name: string
  value: string | boolean | number
}

export type XMLNode = {
  tagName: string
  attributes: XMLAttribute[]
  children?: XMLNode[]
}

export function indent(str: string, cols: number) {
  let prefix = ''
  for (let i = 0; i < cols; i++) {
    prefix += ' '
  }
  return str
    .split('\n')
    .map(l => {
      return prefix + l
    })
    .join('\n')
}

export function nodeTreeToXml(root: XMLNode, level = 0): string {
  const attrStr = root.attributes
    .filter(attr => attr.value !== undefined)
    .map(attr => {
      return `${attr.name}="${attr.value.toString()}"`
    })
    .join(' ')
  const childrenStr = root.children
    ? root.children
        .map(child => {
          return nodeTreeToXml(child, 1)
        })
        .join('\n')
    : ''

  if (childrenStr) {
    return indent(
      `<${root.tagName} ${attrStr}>
${childrenStr}
</${root.tagName}>`,
      level * 2,
    )
  } else {
    return indent(`<${root.tagName} ${attrStr} />`, level * 2)
  }
}

export function attr(name: string, value: string | boolean) {
  return { name, value }
}

export function makeTag(name: string, attrs: XMLAttribute[], children?: XMLNode[]): XMLNode {
  return {
    tagName: name,
    attributes: attrs,
    children,
  }
}

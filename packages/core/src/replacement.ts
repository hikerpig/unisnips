import { SnippetDefinition, PlaceholderReplacement } from './type'

export function applyReplacements(
  def: SnippetDefinition,
  replacements: PlaceholderReplacement[],
): string {
  const contentChars = Array.from(def.body)
  const reversedReplacements = replacements.slice()
  // will replace chars from end to begin,
  // so old start and end won't be affected by previous replacements
  reversedReplacements.sort((a, b) => {
    return b.placeholder.position.start - a.placeholder.position.start
  })
  reversedReplacements.forEach(replacement => {
    const { placeholder, replaceContent } = replacement
    if (replacement.type === 'string' && replaceContent) {
      const holderPos = placeholder.position
      contentChars.splice(holderPos.start, holderPos.end - holderPos.start, ...replaceContent)
    }
  })
  return contentChars.join('')
}

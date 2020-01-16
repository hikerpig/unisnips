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
    return b.placeholder.bodyPosition.start.offset - a.placeholder.bodyPosition.start.offset
  })
  reversedReplacements.forEach(replacement => {
    const { placeholder, replaceContent } = replacement
    if (replacement.type === 'string' && replaceContent) {
      const holderPos = placeholder.bodyPosition
      contentChars.splice(
        holderPos.start.offset,
        holderPos.end.offset - holderPos.start.offset,
        ...replaceContent,
      )
    }
  })
  return contentChars.join('')
}

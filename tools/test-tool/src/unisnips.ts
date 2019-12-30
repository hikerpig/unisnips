import outdent from 'outdent'

export const UNI_SNIPPETS = {
  BUILTIN_VAR: outdent`
  snippet builtin "u"
  $UNI_FILEPATH, $UNI_SELECTED_TEXT
  endsnippet
  `,
}

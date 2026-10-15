export type ParseNumberResult = { value: number } | { error: string }

// One separator kind per value, used only as groups of three (DECISIONS #6).
// Locale-dependent parsing could silently read "85.000" as 85 — the grammar
// rejects anything that is not unambiguously an integer.
const INTEGER_GRAMMAR = /^\d+$|^\d{1,3}([., ])\d{3}(?:\1\d{3})*$/

/** Parses a locale-independent integer with optional thousands grouping. */
export function parseLocaleNumber(input: string): ParseNumberResult {
  const match = INTEGER_GRAMMAR.exec(input)
  if (!match) return { error: 'not a well-formed integer' }

  const separator = match[1]
  const digits = separator ? input.split(separator).join('') : input
  return { value: Number(digits) }
}

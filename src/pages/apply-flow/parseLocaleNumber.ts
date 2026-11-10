export type ParseNumberResult = { value: number } | { error: string }

// One separator kind per value, used only as groups of three, and the first
// group may not start with 0 — "0.123" reads as a float (DECISIONS #6).
// Locale-dependent parsing could silently read "85.000" as 85 — the grammar
// rejects anything that is not unambiguously an integer.
const INTEGER_GRAMMAR = /^\d+$|^[1-9]\d{0,2}([., ])\d{3}(?:\1\d{3})*$/

/** Parses a locale-independent integer with optional thousands grouping. */
export function parseLocaleNumber(input: string): ParseNumberResult {
  const match = INTEGER_GRAMMAR.exec(input)
  if (!match) return { error: 'not a well-formed integer' }

  const separator = match[1]
  const digits = separator ? input.split(separator).join('') : input

  const value = Number(digits)
  // Beyond MAX_SAFE_INTEGER, Number() rounds to a DIFFERENT integer —
  // silent wrong data, the failure mode DECISIONS #6 exists to prevent.
  if (!Number.isSafeInteger(value)) return { error: 'not a safe integer' }
  return { value }
}

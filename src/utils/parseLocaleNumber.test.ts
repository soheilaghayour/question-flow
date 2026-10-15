import { describe, expect, it } from 'vitest'
import { parseLocaleNumber } from './parseLocaleNumber'

describe('parseLocaleNumber — well-formed integers parse', () => {
  it.each([
    ['85000', 85000],
    ['85.000', 85000],
    ['85,000', 85000],
    ['85 000', 85000],
    ['1.234.567', 1234567],
    ['007', 7],
  ])('"%s" → %i', (input, expected) => {
    expect(parseLocaleNumber(input)).toEqual({ value: expected })
  })
})

describe('parseLocaleNumber — anything else is a parse error', () => {
  it.each([
    ['decimal point', '85.5'],
    ['two-digit group (never silently 85)', '85.00'],
    ['misplaced space', '8 5000'],
    ['mixed separators', '1,23.456'],
    ['mixed separator kinds with valid groups', '1.234,567'],
    ['empty string', ''],
    ['not a number', 'abc'],
    ['zero-headed group reads as a float', '0.123'],
    ['beyond MAX_SAFE_INTEGER', '9007199254740993'],
    ['beyond MAX_SAFE_INTEGER, grouped', '9.007.199.254.740.993'],
  ])('%s: "%s" → error', (_name, input) => {
    expect(parseLocaleNumber(input)).toHaveProperty('error')
  })
})

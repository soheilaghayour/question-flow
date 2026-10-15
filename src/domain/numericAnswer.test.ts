import { describe, expect, it } from 'vitest'
import { classifyNumericInput, isValidNumericAnswer } from './numericAnswer'

const bounds = { min: 0, max: 100 }

describe('isValidNumericAnswer', () => {
  it('accepts integers on both bounds and rejects beyond them', () => {
    expect(isValidNumericAnswer(0, bounds)).toBe(true)
    expect(isValidNumericAnswer(100, bounds)).toBe(true)
    expect(isValidNumericAnswer(-1, bounds)).toBe(false)
    expect(isValidNumericAnswer(101, bounds)).toBe(false)
  })

  it('rejects non-integers inside the range', () => {
    expect(isValidNumericAnswer(50.5, bounds)).toBe(false)
  })
})

describe('classifyNumericInput', () => {
  it('classifies whitespace-only as empty, not as an error', () => {
    expect(classifyNumericInput('', bounds)).toEqual({ kind: 'empty' })
    expect(classifyNumericInput('   ', bounds)).toEqual({ kind: 'empty' })
  })

  it('distinguishes a malformed integer from an out-of-range one', () => {
    expect(classifyNumericInput('abc', bounds)).toEqual({ kind: 'not_integer' })
    expect(classifyNumericInput('85,5', bounds)).toEqual({ kind: 'not_integer' })
    expect(classifyNumericInput('200', bounds)).toEqual({ kind: 'out_of_range' })
  })

  it('accepts grouped integers inside the range', () => {
    expect(classifyNumericInput('85.000', { min: 0, max: 100000 })).toEqual({
      kind: 'valid',
      value: 85000,
    })
  })
})

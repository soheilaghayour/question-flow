import { describe, expect, it } from 'vitest'
import { MAX_FILE_SIZE_BYTES, rejectFile } from './fileConstraints'

describe('rejectFile', () => {
  it('accepts each contract type', () => {
    for (const type of [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ]) {
      expect(rejectFile({ type, size: 10 })).toBeUndefined()
    }
  })

  it('rejects a disallowed type before looking at size', () => {
    expect(rejectFile({ type: 'text/plain', size: MAX_FILE_SIZE_BYTES + 1 })).toBe(
      'rejected_type',
    )
  })

  it('accepts exactly 5 MB and rejects one byte more', () => {
    expect(rejectFile({ type: 'application/pdf', size: MAX_FILE_SIZE_BYTES })).toBeUndefined()
    expect(rejectFile({ type: 'application/pdf', size: MAX_FILE_SIZE_BYTES + 1 })).toBe(
      'rejected_size',
    )
  })
})

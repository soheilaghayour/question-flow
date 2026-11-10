import { describe, expect, it } from 'vitest'
import { MAX_FILE_SIZE_BYTES, rejectFile, resolveContentType } from './fileConstraints'

const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

describe('resolveContentType', () => {
  it('trusts a browser-reported contract type', () => {
    expect(resolveContentType({ name: 'cv.pdf', type: 'application/pdf' })).toBe(
      'application/pdf',
    )
  })

  it('falls back to the extension when the browser reports no type', () => {
    // Some OS setups report '' for .docx (no OOXML MIME registry entry).
    expect(resolveContentType({ name: 'cv.docx', type: '' })).toBe(DOCX_TYPE)
    expect(resolveContentType({ name: 'photo.JPG', type: '' })).toBe('image/jpeg')
    expect(resolveContentType({ name: 'photo.jpeg', type: '' })).toBe('image/jpeg')
  })

  it('does not let the extension override a reported non-contract type', () => {
    expect(resolveContentType({ name: 'cv.docx', type: 'text/plain' })).toBeUndefined()
  })

  it('rejects an unknown extension with no reported type', () => {
    expect(resolveContentType({ name: 'notes.txt', type: '' })).toBeUndefined()
    expect(resolveContentType({ name: 'no-extension', type: '' })).toBeUndefined()
  })
})

describe('rejectFile', () => {
  it('accepts each contract type', () => {
    for (const type of ['application/pdf', DOCX_TYPE, 'image/png', 'image/jpeg']) {
      expect(rejectFile({ name: 'f', type, size: 10 })).toBeUndefined()
    }
  })

  it('rejects a disallowed type before looking at size', () => {
    expect(
      rejectFile({ name: 'notes.txt', type: 'text/plain', size: MAX_FILE_SIZE_BYTES + 1 }),
    ).toBe('rejected_type')
  })

  it('accepts exactly 5 MB and rejects one byte more', () => {
    expect(
      rejectFile({ name: 'cv.pdf', type: 'application/pdf', size: MAX_FILE_SIZE_BYTES }),
    ).toBeUndefined()
    expect(
      rejectFile({ name: 'cv.pdf', type: 'application/pdf', size: MAX_FILE_SIZE_BYTES + 1 }),
    ).toBe('rejected_size')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { getStoredLanguage, storeLanguage } from './storedLanguage'

describe('getStoredLanguage', () => {
  it('reads a stored language', () => {
    storeLanguage('de')
    expect(getStoredLanguage()).toBe('de')
  })

  it.each([
    ['nothing stored', null],
    ['an unsupported value', 'fr'],
  ])('falls back to English for %s', (_label, stored) => {
    if (stored !== null) localStorage.setItem('ui-language', stored)
    expect(getStoredLanguage()).toBe('en')
  })

  it('falls back to English when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(getStoredLanguage()).toBe('en')
  })
})

describe('storeLanguage', () => {
  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(() => storeLanguage('de')).not.toThrow()
  })
})

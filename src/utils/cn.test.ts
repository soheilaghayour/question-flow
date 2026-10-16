import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins the truthy class names with single spaces', () => {
    expect(cn('a', false, undefined, '', 'b')).toBe('a b')
  })
})

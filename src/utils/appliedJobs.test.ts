import { afterEach, describe, expect, it, vi } from 'vitest'
import { readAppliedJobIds, recordAppliedJob } from './appliedJobs'

const STORAGE_KEY = 'applied-job-ids'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('readAppliedJobIds', () => {
  it('returns nothing when no ids were stored', () => {
    expect(readAppliedJobIds()).toEqual([])
  })

  it.each([
    ['invalid JSON', '{not json'],
    ['a bare string', '"job-short"'],
    ['an object', '{"job-short":true}'],
    ['null', 'null'],
  ])('reads %s as nothing applied', (_label, stored) => {
    localStorage.setItem(STORAGE_KEY, stored)
    expect(readAppliedJobIds()).toEqual([])
  })

  it('skips entries that are not strings', () => {
    localStorage.setItem(STORAGE_KEY, '["job-short", 7, null, {"id":"x"}, "job-long"]')
    expect(readAppliedJobIds()).toEqual(['job-short', 'job-long'])
  })

  // Blocked storage (cross-origin iframe, cookies off) throws on access.
  it('reads blocked storage as nothing applied', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(readAppliedJobIds()).toEqual([])
  })
})

describe('recordAppliedJob', () => {
  it('stores the id so a later read returns it', () => {
    recordAppliedJob('job-short')
    recordAppliedJob('job-long')
    expect(readAppliedJobIds()).toEqual(['job-short', 'job-long'])
  })

  it('stores an id only once', () => {
    recordAppliedJob('job-short')
    recordAppliedJob('job-short')
    expect(readAppliedJobIds()).toEqual(['job-short'])
  })

  it('does not throw when writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(() => recordAppliedJob('job-short')).not.toThrow()
    expect(readAppliedJobIds()).toEqual([])
  })
})

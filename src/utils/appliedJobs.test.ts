import { describe, expect, it, vi } from 'vitest'
import { readAppliedJobIds, recordAppliedJob } from './appliedJobs'

describe('readAppliedJobIds', () => {
  it('returns nothing when no ids were stored', () => {
    expect(readAppliedJobIds()).toEqual([])
  })

  it.each([
    ['invalid JSON', '{not json'],
    ['a bare string', '"job-short"'],
    ['null', 'null'],
  ])('reads %s as nothing applied', (_label, stored) => {
    localStorage.setItem('applied-job-ids', stored)
    expect(readAppliedJobIds()).toEqual([])
  })
})

describe('recordAppliedJob', () => {
  it('stores each id once', () => {
    recordAppliedJob('job-short')
    recordAppliedJob('job-long')
    recordAppliedJob('job-short')
    expect(readAppliedJobIds()).toEqual(['job-short', 'job-long'])
  })

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(() => recordAppliedJob('job-short')).not.toThrow()
  })
})

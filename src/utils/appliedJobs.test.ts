import { describe, expect, it, vi } from 'vitest'
import { getAppliedJobIdsFromStorage, addAppliedJobIdToStorage } from './appliedJobs'

describe('getAppliedJobIdsFromStorage', () => {
  it('returns nothing when no ids were stored', () => {
    expect(getAppliedJobIdsFromStorage()).toEqual([])
  })

  it.each([
    ['invalid JSON', '{not json'],
    ['a bare string', '"job-short"'],
    ['null', 'null'],
  ])('reads %s as nothing applied', (_label, stored) => {
    localStorage.setItem('applied-job-ids', stored)
    expect(getAppliedJobIdsFromStorage()).toEqual([])
  })
})

describe('addAppliedJobIdToStorage', () => {
  it('stores each id once', () => {
    addAppliedJobIdToStorage('job-short')
    addAppliedJobIdToStorage('job-long')
    addAppliedJobIdToStorage('job-short')
    expect(getAppliedJobIdsFromStorage()).toEqual(['job-short', 'job-long'])
  })

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    expect(() => addAppliedJobIdToStorage('job-short')).not.toThrow()
  })
})

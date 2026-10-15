const STORAGE_KEY = 'applied-job-ids'

/** Returns the ids of the jobs this browser has applied to. */
export function getAppliedJobIdsFromStorage(): string[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

/** Adds `jobId` to the stored applied job ids. */
export function addAppliedJobIdToStorage(jobId: string) {
  const ids = getAppliedJobIdsFromStorage()
  try {
    if (!ids.includes(jobId)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, jobId]))
  } catch {
    // storage blocked: the submission still stands
  }
}

const STORAGE_KEY = 'applied-job-ids'

/** Returns the ids of the jobs this browser has applied to. */
export function readAppliedJobIds(): string[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

/** Adds `jobId` to the stored applied job ids. */
export function recordAppliedJob(jobId: string) {
  const ids = readAppliedJobIds()
  if (!ids.includes(jobId)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, jobId]))
}

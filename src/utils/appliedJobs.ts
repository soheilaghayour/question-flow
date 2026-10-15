const STORAGE_KEY = 'applied-job-ids'

/** Returns the ids of the jobs this browser has applied to. */
export function readAppliedJobIds(): readonly string[] {
  // Storage is untrusted input: blocked access throws, and anything other
  // than a JSON array of strings (hand-edited, older format) reads as
  // "nothing applied" — a wrongly enabled Apply beats a crashed page.
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

/** Adds `jobId` to the stored applied job ids. */
export function recordAppliedJob(jobId: string) {
  const ids = readAppliedJobIds()
  if (ids.includes(jobId)) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, jobId]))
  } catch {
    // Losing the record only re-enables Apply; the submission itself stands.
  }
}

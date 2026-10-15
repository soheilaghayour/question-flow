/** The browser-history protocol behind DECISIONS #31/#33: one entry per
 * screen or wizard step, every back control is history.back(). This module is
 * the only place the entry shape exists — both writers and both popstate
 * listeners speak through it. */

export interface FormEntry {
  screen: 'form'
  /** Which ApplyFlow mount wrote the entry — see startFormSession. */
  session: number
  step: number
}

export interface JobsEntry {
  screen: 'jobs'
}

export type AppHistoryEntry = FormEntry | JobsEntry

// Entries outlive the application that wrote them (submit, leave, re-apply),
// so each ApplyFlow mount gets a fresh session id: a popstate carrying any
// other session is stale history and must never drive the current form.
let currentSession = 0

export function startFormSession(): number {
  return ++currentSession
}

export function endFormSession(): void {
  currentSession++
}

export function pushEntry(entry: AppHistoryEntry): void {
  history.pushState(entry, '')
}

export function replaceEntry(entry: AppHistoryEntry): void {
  history.replaceState(entry, '')
}

export function entryOf(event: PopStateEvent): AppHistoryEntry | null {
  const state = event.state as AppHistoryEntry | null
  return state && (state.screen === 'form' || state.screen === 'jobs') ? state : null
}

/** Whether the entry was written by the currently mounted, not-yet-submitted
 * form. Not a type predicate on purpose: a STALE form entry is still a
 * FormEntry — narrowing it away on `false` would be unsound. */
export function isLiveFormEntry(entry: AppHistoryEntry | null): boolean {
  return entry !== null && entry.screen === 'form' && entry.session === currentSession
}

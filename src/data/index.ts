import shortJson from '@jobs/short.json'
import longJson from '@jobs/long.json'
import badJson from '@jobs/bad.json'
import profileJson from '@profile'
import { profileSchema, type Profile } from '@/domain/schema'

/** The single point where fixtures enter the app, keyed by job id. Configs stay
 * `unknown`: raw configs lie (bite #8), so nothing may render one that hasn't gone
 * through normalizeJob(). */
export const rawJobConfigsById: ReadonlyMap<string, unknown> = new Map<string, unknown>([
  [shortJson.id, shortJson],
  [longJson.id, longJson],
  [badJson.id, badJson],
])

/** The profile is a trusted fixture, parsed once; a broken edit fails loudly here. */
export const profile: Profile = profileSchema.parse(profileJson)

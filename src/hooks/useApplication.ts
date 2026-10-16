import { useEffect, useMemo } from 'react'
import { profile, rawJobConfigsById } from '@/data'
import { normalizeJob } from '@/domain/normalize'
import { buildPrefillAnswers } from '@/domain/prefill'
import { buildSteps } from '@/domain/wizard'

/** Turns a job id into the normalized job, its prefilled answers and its wizard steps. */
export function useApplication(jobId: string) {
  const application = useMemo(() => {
    const result = normalizeJob(rawJobConfigsById.get(jobId))
    if ('error' in result) return result
    const initialAnswers = buildPrefillAnswers(result.job.questions, profile)
    return { ...result, initialAnswers, steps: buildSteps(result.job.questions, initialAnswers) }
  }, [jobId])

  // Config problems are the recruiter's bug to hear about (DECISIONS #10) —
  // once per config, not per render.
  useEffect(() => {
    if ('job' in application)
      for (const warning of application.warnings)
        console.warn(`[${warning.questionId}] ${warning.reason}`)
  }, [application])

  return application
}

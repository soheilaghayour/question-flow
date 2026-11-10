import { useEffect, useMemo } from 'react'
import { profile, rawJobConfigsById } from '@/data'
import { normalizeJob } from '@/data/normalize'
import { buildPrefillAnswers } from './prefill'
import { buildSteps } from './wizard'

/** Turns a job id into the normalized job, its prefilled answers and its wizard steps. */
export function useJobWizard(jobId: string) {
  const application = useMemo(() => {
    const result = normalizeJob(rawJobConfigsById.get(jobId))
    if ('error' in result) return result
    const initialAnswers = buildPrefillAnswers(result.job.questions, profile)
    return { ...result, initialAnswers, steps: buildSteps(result.job.questions, initialAnswers) }
  }, [jobId])

  useEffect(() => {
    if ('job' in application)
      for (const warning of application.warnings)
        console.warn(`[${warning.questionId}] ${warning.reason}`)
  }, [application])

  return application
}

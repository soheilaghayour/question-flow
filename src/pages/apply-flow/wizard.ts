import type { Question } from '@/data/schema'
import type { Answers } from './payload'
import { hasAnswer } from './answers'

export const QUESTIONS_PER_STEP = 3

/** One wizard screen of questions; `prefilled` marks the confirm-your-profile step. */
export interface WizardStep {
  questions: Question[]
  prefilled: boolean
}

/** Splits questions into wizard steps from the prefill-aware initial answers. */
// Prefilled questions lead as one confirm step — completed work shown as
// completed, the lesson from the discarded focus mode (#33–#35). The rest
// follows in config order, QUESTIONS_PER_STEP at a time. hasAnswer keeps
// "prefilled" in lockstep with the submit gate and the progress count.
export function buildSteps(questions: Question[], initialAnswers: Answers) {
  const prefilled = questions.filter((question) => hasAnswer(initialAnswers[question.id]))
  const open = questions.filter((question) => !hasAnswer(initialAnswers[question.id]))

  const steps: WizardStep[] = prefilled.length > 0 ? [{ prefilled: true, questions: prefilled }] : []
  for (let i = 0; i < open.length; i += QUESTIONS_PER_STEP)
    steps.push({ prefilled: false, questions: open.slice(i, i + QUESTIONS_PER_STEP) })
  return steps
}

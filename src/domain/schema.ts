import { z } from 'zod'

// Contract types + zod schemas for job configs and the candidate profile.
// Keys stay snake_case exactly as the README defines them — no renames.
//
// These schemas describe a VALID question/job. Recovering from invalid ones
// (dropping questions, stripping broken rules, deduping IDs) is normalize.ts's
// job — schemas here reject, they never repair.

/** Authoring limit for recruiter question text. Exceeding it is a warning in
 * normalize.ts, never a rejection — the candidate still sees the question. */
export const QUESTION_TEXT_MAX_LENGTH = 255

/** The profile fields the README maps into profile.json. An unknown
 * profile_field keeps its question — it simply never prefills — so the base
 * schema validates it as a plain string and prefill.ts checks membership. */
export const PROFILE_FIELDS = [
  'notice_period',
  'salary_expectation',
  'city',
  'german_level',
  'english_level',
  'years_of_experience',
] as const

export type ProfileField = (typeof PROFILE_FIELDS)[number]

const baseQuestionFields = {
  id: z.string().min(1),
  question: z.string().min(1),
  required: z.boolean().default(false),
  profile_field: z.string().optional(),
}

// Unknown keys are stripped by z.object, which is exactly the README's rule
// "a screening rule on a type it is not allowed on is ignored": must_be_true
// on a text question simply disappears. Rules are declared only on the types
// they are allowed on.

export const textQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('text'),
  multiline: z.boolean().default(false),
})

export const dateQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('date'),
})

export const booleanQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('boolean'),
  must_be_true: z.boolean().optional(),
})

export const numericQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('numeric'),
  min: z.number().int().default(0),
  max: z.number().int().default(100000000),
  must_be_at_least: z.number().int().optional(),
  must_be_below: z.number().int().optional(),
})

export const selectOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

export const selectQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('select'),
  options: z.array(selectOptionSchema).min(1),
  max_choices: z.number().int().min(1).default(1),
})

export const fileQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal('file'),
})

export const questionSchema = z.discriminatedUnion('type', [
  textQuestionSchema,
  dateQuestionSchema,
  booleanQuestionSchema,
  numericQuestionSchema,
  selectQuestionSchema,
  fileQuestionSchema,
])

export const jobSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  language: z.enum(['de', 'en']),
  questions: z.array(questionSchema),
})

export type TextQuestion = z.infer<typeof textQuestionSchema>
export type DateQuestion = z.infer<typeof dateQuestionSchema>
export type BooleanQuestion = z.infer<typeof booleanQuestionSchema>
export type NumericQuestion = z.infer<typeof numericQuestionSchema>
export type SelectOption = z.infer<typeof selectOptionSchema>
export type SelectQuestion = z.infer<typeof selectQuestionSchema>
export type FileQuestion = z.infer<typeof fileQuestionSchema>
export type Question = z.infer<typeof questionSchema>
export type QuestionType = Question['type']
export type Job = z.infer<typeof jobSchema>

// Candidate profile (profile.json). Only the parts the contract's
// profile_field table reaches are required; the rest is carried as-is.

export const profileLanguageSchema = z.object({
  language: z.string().min(1),
  level: z.string().min(1),
})

export const profileSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  headline: z.string().optional(),
  location: z.object({
    city: z.string(),
    country: z.string().optional(),
  }),
  citizenship: z.array(z.string()).optional(),
  salary_expectation: z.object({
    amount: z.number().int(),
    currency: z.string().optional(),
    period: z.string().optional(),
  }),
  languages: z.array(profileLanguageSchema),
  notice_period: z.string(),
  years_of_experience: z.number().int(),
})

export type Profile = z.infer<typeof profileSchema>

import { z } from 'zod'

/** Authoring limit for question text — normalize warns on excess, never drops (DECISIONS #10). */
export const QUESTION_TEXT_MAX_LENGTH = 255

/** An unknown profile_field keeps its question; prefill just skips it (DECISIONS #17). */
export const PROFILE_FIELDS = [
  'notice_period',
  'salary_expectation',
  'city',
  'german_level',
  'english_level',
  'years_of_experience',
] as const

export type ProfileField = (typeof PROFILE_FIELDS)[number]

/** Single owner of rule → allowed type + value shape. normalize.ts reads this to
 * strip misplaced/malformed rules with a warning BEFORE the strict parse below,
 * which would otherwise swallow or reject them silently (DECISIONS #10, #17). */
export const SCREENING_RULES = {
  must_be_at_least: { allowedOn: 'numeric', valueSchema: z.number().int() },
  must_be_below: { allowedOn: 'numeric', valueSchema: z.number().int() },
  must_be_true: { allowedOn: 'boolean', valueSchema: z.boolean() },
} as const

export type ScreeningRuleName = keyof typeof SCREENING_RULES

const baseQuestionFields = {
  id: z.string().min(1),
  question: z.string().min(1),
  required: z.boolean().default(false),
  profile_field: z.string().optional(),
}

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
  must_be_true: SCREENING_RULES.must_be_true.valueSchema.optional(),
})

export const numericQuestionSchema = z
  .object({
    ...baseQuestionFields,
    type: z.literal('numeric'),
    min: z.number().int().default(0),
    max: z.number().int().default(100000000),
    must_be_at_least: SCREENING_RULES.must_be_at_least.valueSchema.optional(),
    must_be_below: SCREENING_RULES.must_be_below.valueSchema.optional(),
  })
  .refine((q) => q.min <= q.max, { message: 'min must be <= max' })

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

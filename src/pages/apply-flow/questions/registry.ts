import type { ComponentType } from 'react'
import type {
  BooleanQuestion as BooleanQuestionConfig,
  DateQuestion as DateQuestionConfig,
  FileQuestion as FileQuestionConfig,
  NumericQuestion as NumericQuestionConfig,
  QuestionType,
  SelectQuestion as SelectQuestionConfig,
  TextQuestion as TextQuestionConfig,
} from '@/data/schema'
import type { FileAnswerValue } from '@/pages/apply-flow/payload'
import { BooleanQuestion } from './BooleanQuestion'
import { DateQuestion } from './DateQuestion'
import { FileQuestion } from './FileQuestion'
import { NumericQuestion } from './NumericQuestion'
import { SelectQuestion } from './SelectQuestion'
import { TextQuestion } from './TextQuestion'

/** Props every question component takes; null means no answer. */
export type QuestionComponent<Config, Value> = ComponentType<{
  question: Config
  value: Value | null
  onChange: (value: Value | null) => void
  error?: string
}>

/** Question type → component. */
export const questionRegistry: {
  text: QuestionComponent<TextQuestionConfig, string>
  numeric: QuestionComponent<NumericQuestionConfig, number>
  date: QuestionComponent<DateQuestionConfig, string>
  boolean: QuestionComponent<BooleanQuestionConfig, boolean>
  select: QuestionComponent<SelectQuestionConfig, string | string[]>
  file: QuestionComponent<FileQuestionConfig, FileAnswerValue>
} = {
  text: TextQuestion,
  numeric: NumericQuestion,
  date: DateQuestion,
  boolean: BooleanQuestion,
  select: SelectQuestion,
  file: FileQuestion,
} satisfies Record<QuestionType, unknown>

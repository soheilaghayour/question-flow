import type { ComponentType } from 'react'
import type {
  BooleanQuestion as BooleanQuestionConfig,
  DateQuestion as DateQuestionConfig,
  FileQuestion as FileQuestionConfig,
  NumericQuestion as NumericQuestionConfig,
  QuestionType,
  SelectQuestion as SelectQuestionConfig,
  TextQuestion as TextQuestionConfig,
} from '@/domain/schema'
import type { FileAnswerValue } from '@/domain/payload'
import { BooleanQuestion } from './BooleanQuestion'
import { DateQuestion } from './DateQuestion'
import { FileQuestion } from './FileQuestion'
import { NumericQuestion } from './NumericQuestion'
import { SelectQuestion } from './SelectQuestion'
import { TextQuestion } from './TextQuestion'

/** The controlled seam every question component shares: config in, current
 * answer in, next answer (or null = no answer) out, flow-computed error in. */
export type QuestionComponent<Config, Value> = ComponentType<{
  question: Config
  value: Value | null
  onChange: (value: Value | null) => void
  error?: string
}>

/** Type → component. The flow renders a Question via QuestionField (which owns
 * the one correlated-union cast this record needs) and never switches on type;
 * a new question type is one component + one entry. */
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
}

// A question type added to the schema must fail compilation here until it has
// a component; an entry without a schema type can't exist in the shape above.
const registryCoversEveryType: Record<QuestionType, unknown> = questionRegistry
void registryCoversEveryType

import type { z } from "zod";
import {
  booleanQuestionSchema,
  dateQuestionSchema,
  fileQuestionSchema,
  jobSchema,
  numericQuestionSchema,
  QUESTION_TEXT_MAX_LENGTH,
  SCREENING_RULES,
  selectOptionSchema,
  selectQuestionSchema,
  textQuestionSchema,
  type Job,
  type Question,
  type QuestionType,
} from "./schema";

export type NormalizeWarning = { questionId: string; reason: string };

export type NormalizeResult =
  { job: Job; warnings: NormalizeWarning[] } | { error: string };

/** `satisfies` keeps this registry in lockstep with the QuestionType union. */
const QUESTION_SCHEMAS = {
  text: textQuestionSchema,
  date: dateQuestionSchema,
  boolean: booleanQuestionSchema,
  numeric: numericQuestionSchema,
  select: selectQuestionSchema,
  file: fileQuestionSchema,
} satisfies Record<QuestionType, z.ZodType<Question>>;

const jobShellSchema = jobSchema.omit({ questions: true });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Validates a raw job config question by question, so one broken question
 * never rejects the whole job.
 */
export function normalizeJob(rawJob: unknown): NormalizeResult {
  if (!isRecord(rawJob)) return { error: "job config is not an object" };

  const shell = jobShellSchema.safeParse(rawJob);
  if (!shell.success) return { error: `invalid job: ${shell.error.message}` };
  if (!Array.isArray(rawJob.questions))
    return { error: "job has no questions array" };

  const warnings: NormalizeWarning[] = [];
  const addWarning = (questionId: string, reason: string) => {
    warnings.push({ questionId, reason });
  };
  const questions: Question[] = [];

  rawJob.questions.forEach((rawQuestion: unknown, index: number) => {
    const fallbackId = `questions[${index}]`;

    if (!isRecord(rawQuestion)) {
      addWarning(fallbackId, "question is not an object");
      return;
    }

    const questionId = isNonEmptyString(rawQuestion.id)
      ? rawQuestion.id
      : fallbackId;

    if (
      !isNonEmptyString(rawQuestion.id) ||
      !isNonEmptyString(rawQuestion.question) ||
      !isNonEmptyString(rawQuestion.type)
    ) {
      addWarning(questionId, "missing id, question or type");
      return;
    }

    if (!(rawQuestion.type in QUESTION_SCHEMAS)) {
      addWarning(questionId, `unknown question type "${rawQuestion.type}"`);
      return;
    }
    const schema = QUESTION_SCHEMAS[rawQuestion.type as QuestionType];

    // Pre-clean before the strict parse: zod would strip a misplaced rule
    // silently and reject a whole question over one bad rule value, but the
    // policy is drop-the-smallest-thing-with-a-warning (DECISIONS #10, #17).
    // Cleaning deletes keys, so it works on a shallow copy — the caller's
    // config (an imported JSON module) must never be mutated.
    const candidateQuestion: Record<string, unknown> = { ...rawQuestion };

    for (const [name, rule] of Object.entries(SCREENING_RULES)) {
      if (!(name in candidateQuestion)) continue;
      if (rule.allowedOn !== candidateQuestion.type) {
        delete candidateQuestion[name];
        addWarning(
          questionId,
          `rule "${name}" is not allowed on type "${rawQuestion.type}" — ignored`,
        );
      } else if (!rule.valueSchema.safeParse(candidateQuestion[name]).success) {
        delete candidateQuestion[name];
        addWarning(questionId, `rule "${name}" has an invalid value — ignored`);
      }
    }

    if (
      candidateQuestion.type === "select" &&
      Array.isArray(candidateQuestion.options)
    ) {
      const seenValues = new Set<string>();
      const options: z.infer<typeof selectOptionSchema>[] = [];
      for (const rawOption of candidateQuestion.options) {
        const option = selectOptionSchema.safeParse(rawOption);
        if (!option.success) {
          addWarning(questionId, "malformed option dropped");
          continue;
        }
        if (seenValues.has(option.data.value)) {
          addWarning(
            questionId,
            `duplicate option value "${option.data.value}" — first wins`,
          );
          continue;
        }
        seenValues.add(option.data.value);
        options.push(option.data);
      }
      if (options.length === 0) {
        addWarning(questionId, "no valid options left — question dropped");
        return;
      }
      candidateQuestion.options = options;
    }

    if (rawQuestion.question.length > QUESTION_TEXT_MAX_LENGTH) {
      addWarning(
        questionId,
        `question text exceeds ${QUESTION_TEXT_MAX_LENGTH} characters`,
      );
    }

    const parsed = schema.safeParse(candidateQuestion);
    if (!parsed.success) {
      addWarning(
        questionId,
        `invalid question: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
      );
      return;
    }

    questions.push(parsed.data);
  });

  // Dedupe AFTER dropping invalid questions, so an ignored question never
  // shadows a valid later one with the same ID (DECISIONS #10).
  const seenIds = new Set<string>();
  const deduped = questions.filter((question) => {
    if (seenIds.has(question.id)) {
      addWarning(question.id, "duplicate question id — first wins");
      return false;
    }
    seenIds.add(question.id);
    return true;
  });

  if (deduped.length === 0) return { error: "job has no valid questions" };

  return { job: { ...shell.data, questions: deduped }, warnings };
}

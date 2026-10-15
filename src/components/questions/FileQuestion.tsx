import { useRef, useState } from 'react'
import type { FileQuestion as FileQuestionConfig } from '@/domain/schema'
import type { FileAnswerValue } from '@/domain/payload'
import { MAX_FILE_SIZE_BYTES, type FileRejection } from '@/domain/fileConstraints'
import { fileToBase64 } from '@/utils/fileToBase64'
import { assertNever } from '@/utils/assertNever'
import { Field } from '@/components/molecules/Field'
import { FileDrop, type FileSelection } from '@/components/molecules/FileDrop'
import { useI18n } from '@/i18n/useI18n'
import type { TranslationKey } from '@/i18n/en'

type FileIssue = FileRejection | 'read_failed'

// Exhaustive by assertNever (same pattern as payload.ts): a new issue kind
// must fail compilation here, not silently clear the answer with no message.
function issueKey(issue: FileIssue): TranslationKey {
  switch (issue) {
    case 'rejected_type':
      return 'error_file_type'
    case 'rejected_size':
      return 'error_file_size'
    case 'read_failed':
      return 'error_file_read'
    default:
      return assertNever(issue)
  }
}

interface FileQuestionProps {
  question: FileQuestionConfig
  value: FileAnswerValue | null
  onChange: (value: FileAnswerValue | null) => void
  error?: string
}

export function FileQuestion({ question, value, onChange, error }: FileQuestionProps) {
  // The issue KIND is stored, not the message, so a language toggle
  // re-translates a visible error.
  const [issue, setIssue] = useState<FileIssue | null>(null)
  // Latest-wins: a slow base64 read must not overwrite the outcome of a
  // selection made after it.
  const selectionSeq = useRef(0)
  const { t } = useI18n()

  const handleSelect = async (selection: FileSelection) => {
    const seq = ++selectionSeq.current
    if (selection.kind !== 'accepted') {
      setIssue(selection.kind)
      onChange(null)
      return
    }
    try {
      const data = await fileToBase64(selection.file)
      if (seq !== selectionSeq.current) return
      setIssue(null)
      onChange({
        content_type: selection.contentType,
        data,
        file_name: selection.file.name,
      })
    } catch {
      if (seq !== selectionSeq.current) return
      setIssue('read_failed')
      onChange(null)
    }
  }

  const issueMessage =
    issue === null
      ? undefined
      : t(issueKey(issue)).replace('{max}', String(MAX_FILE_SIZE_BYTES / (1024 * 1024)))

  return (
    <Field id={question.id} label={question.question} error={issueMessage ?? error}>
      {(inputProps) => (
        <FileDrop
          inputProps={inputProps}
          fileName={value?.file_name}
          onSelect={(selection) => void handleSelect(selection)}
        />
      )}
    </Field>
  )
}

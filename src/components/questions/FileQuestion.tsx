import { useState } from 'react'
import type { FileQuestion as FileQuestionConfig } from '@/domain/schema'
import type { FileAnswerValue } from '@/domain/payload'
import { fileToBase64 } from '@/utils/fileToBase64'
import { Field } from '@/components/molecules/Field'
import {
  FileDrop,
  MAX_FILE_SIZE_BYTES,
  type FileSelection,
} from '@/components/molecules/FileDrop'
import { useI18n } from '@/i18n/useI18n'

interface FileQuestionProps {
  question: FileQuestionConfig
  value: FileAnswerValue | null
  onChange: (value: FileAnswerValue | null) => void
  error?: string
}

export function FileQuestion({ question, value, onChange, error }: FileQuestionProps) {
  // The rejection kind is stored, not the message, so a language toggle
  // re-translates a visible error.
  const [rejection, setRejection] = useState<'rejected_type' | 'rejected_size' | null>(null)
  const { t } = useI18n()

  const handleSelect = async (selection: FileSelection) => {
    if (selection.kind !== 'accepted') {
      setRejection(selection.kind)
      onChange(null)
      return
    }
    setRejection(null)
    onChange({
      content_type: selection.file.type,
      data: await fileToBase64(selection.file),
      file_name: selection.file.name,
    })
  }

  const rejectionMessage =
    rejection === 'rejected_type'
      ? t('error_file_type')
      : rejection === 'rejected_size'
        ? t('error_file_size').replace('{max}', String(MAX_FILE_SIZE_BYTES / (1024 * 1024)))
        : undefined

  return (
    <Field id={question.id} label={question.question} error={rejectionMessage ?? error}>
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

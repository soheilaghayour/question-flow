import type { FieldInputProps } from './Field'

/** Contract limits (README): PDF, DOCX, PNG, JPG up to 5 MB — question prose
 * never changes them (DECISIONS #9). */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
] as const

/** Validation happens here, not in the browser's accept filter: drag & drop
 * and "All files" pickers bypass `accept`, so every selection is re-checked. */
export type FileSelection =
  | { kind: 'accepted'; file: File }
  | { kind: 'rejected_type' }
  | { kind: 'rejected_size' }

interface FileDropProps {
  inputProps: FieldInputProps
  fileName?: string
  onSelect: (selection: FileSelection) => void
}

function validate(file: File): FileSelection {
  if (!ACCEPTED_CONTENT_TYPES.some((type) => type === file.type)) return { kind: 'rejected_type' }
  if (file.size > MAX_FILE_SIZE_BYTES) return { kind: 'rejected_size' }
  return { kind: 'accepted', file }
}

export function FileDrop({ inputProps, fileName, onSelect }: FileDropProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        {...inputProps}
        type="file"
        accept={ACCEPTED_CONTENT_TYPES.join(',')}
        className="w-full rounded border border-muted bg-surface px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-on-primary aria-invalid:border-error focus-ring"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(validate(file))
        }}
      />
      {fileName && <p className="text-sm text-muted">{fileName}</p>}
    </div>
  )
}

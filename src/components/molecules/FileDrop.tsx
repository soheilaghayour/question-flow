import { ACCEPTED_CONTENT_TYPES, rejectFile, type FileRejection } from '@/domain/fileConstraints'
import type { FieldInputProps } from './Field'

export type FileSelection = { kind: 'accepted'; file: File } | { kind: FileRejection }

interface FileDropProps {
  inputProps: FieldInputProps
  fileName?: string
  onSelect: (selection: FileSelection) => void
}

/** Every selection is re-checked against the contract rules: drag & drop and
 * "All files" pickers bypass the browser's `accept` filter. */
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
          if (!file) return
          const rejection = rejectFile(file)
          onSelect(rejection ? { kind: rejection } : { kind: 'accepted', file })
        }}
      />
      {fileName && <p className="text-sm text-muted">{fileName}</p>}
    </div>
  )
}

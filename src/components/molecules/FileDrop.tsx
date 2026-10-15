import {
  ACCEPTED_CONTENT_TYPES,
  resolveContentType,
  rejectFile,
  type AcceptedContentType,
  type FileRejection,
} from '@/domain/fileConstraints'
import type { FieldInputProps } from './Field'

/** contentType travels with the file: it may come from the extension fallback,
 * so the consumer must not re-read file.type. */
export type FileSelection =
  | { kind: 'accepted'; file: File; contentType: AcceptedContentType }
  | { kind: FileRejection }

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
          // Reset so re-picking the same path (e.g. the same file compressed
          // under 5 MB) fires a fresh change event — browsers skip it when the
          // value string is unchanged.
          event.target.value = ''
          if (!file) return
          const rejection = rejectFile(file)
          if (rejection) {
            onSelect({ kind: rejection })
            return
          }
          // rejectFile passing guarantees resolveContentType is defined.
          const contentType = resolveContentType(file)
          if (contentType) onSelect({ kind: 'accepted', file, contentType })
        }}
      />
      {fileName && <p className="text-sm text-muted">{fileName}</p>}
    </div>
  )
}

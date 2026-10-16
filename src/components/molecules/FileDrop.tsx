import { useRef } from 'react'
import {
  ACCEPTED_CONTENT_TYPES,
  resolveContentType,
  rejectFile,
  type AcceptedContentType,
  type FileRejection,
} from '@/domain/fileConstraints'
import { Button } from '@/components/atoms/Button'
import { Text } from '@/components/atoms/Text'
import type { FieldInputProps } from './Field'

/** contentType travels with the file: it may come from the extension fallback,
 * so the consumer must not re-read file.type. */
export type FileSelection =
  | { kind: 'accepted'; file: File; contentType: AcceptedContentType }
  | { kind: FileRejection }

interface FileDropProps {
  inputProps: FieldInputProps
  chooseLabel: string
  fileName?: string
  onSelect: (selection: FileSelection) => void
}

/** Every selection is re-checked against the contract rules: drag & drop and
 * "All files" pickers bypass the browser's `accept` filter. */
export function FileDrop({ inputProps, chooseLabel, fileName, onSelect }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleFile = (file: File) => {
    const rejection = rejectFile(file)
    if (rejection) {
      onSelect({ kind: rejection })
      return
    }
    // rejectFile passing guarantees resolveContentType is defined.
    const contentType = resolveContentType(file)
    if (contentType) onSelect({ kind: 'accepted', file, contentType })
  }
  return (
    // The whole control stays a drop target: the native input (a drop target
    // by itself) is visually hidden, so the wrapper takes over that role.
    <div
      className="flex flex-col gap-1"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file) handleFile(file)
      }}
    >
      {/* The native input is visually hidden: its value is reset after every
          selection (see below), so its own "no file chosen" text would claim
          no file exists while one is held in form state. The button triggers
          it; the fileName line below is the single source of truth. */}
      <input
        {...inputProps}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_CONTENT_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Reset so re-picking the same path (e.g. the same file compressed
          // under 5 MB) fires a fresh change event — browsers skip it when the
          // value string is unchanged.
          event.target.value = ''
          if (file) handleFile(file)
        }}
      />
      {/* The hidden input keeps the id (label association + tests target it),
          but it is unreachable by keyboard/mouse — so the visible button also
          carries the describedby: whoever focuses it hears hint and error. */}
      <Button
        className="self-start"
        aria-describedby={inputProps['aria-describedby']}
        onClick={() => inputRef.current?.click()}
      >
        {chooseLabel}
      </Button>
      {fileName && <Text tone="muted" size="sm">{fileName}</Text>}
    </div>
  )
}

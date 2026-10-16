import { useRef, type ChangeEvent, type DragEvent } from 'react'
import {
  ACCEPTED_CONTENT_TYPES,
  resolveContentType,
  rejectFile,
  type AcceptedContentType,
  type FileRejection,
} from '@/domain/fileConstraints'
import { Button } from '@/components/atoms/Button'
import { FileInput } from '@/components/atoms/FileInput'
import { Text } from '@/components/atoms/Text'
import type { FieldInputProps } from './Field'

export type FileSelection =
  | { kind: 'accepted'; file: File; contentType: AcceptedContentType }
  | { kind: FileRejection }

interface FileDropProps {
  inputProps: FieldInputProps
  chooseLabel: string
  fileName?: string
  onSelect: (selection: FileSelection) => void
}

export function FileDrop({ inputProps, chooseLabel, fileName, onSelect }: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Drag & drop and "All files" pickers bypass `accept`, so every file is re-checked.
  const handleFile = (file?: File) => {
    if (!file) return
    const rejection = rejectFile(file)
    if (rejection) {
      onSelect({ kind: rejection })
      return
    }
    const contentType = resolveContentType(file)
    if (contentType) onSelect({ kind: 'accepted', file, contentType })
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    handleFile(event.dataTransfer.files?.[0])
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset so picking the same file again still fires change.
    event.target.value = ''
    handleFile(file)
  }

  return (
    <div
      className="flex flex-col gap-1"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <FileInput
        {...inputProps}
        ref={inputRef}
        accept={ACCEPTED_CONTENT_TYPES.join(',')}
        onChange={handleChange}
      />
      <Button
        className="self-start"
        aria-describedby={inputProps['aria-describedby']}
        onClick={() => inputRef.current?.click()}
      >
        {chooseLabel}
      </Button>
      {fileName && (
        <Text tone="muted" size="sm">
          {fileName}
        </Text>
      )}
    </div>
  )
}

/** Contract limits (docs/task-contract.md): PDF, DOCX, PNG, JPG up to 5 MB — question prose
 * never changes them (DECISIONS #9). */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
] as const

export type AcceptedContentType = (typeof ACCEPTED_CONTENT_TYPES)[number]

// The contract mandates formats, not MIME-sniffing as the mechanism: some OS
// setups report '' for .docx, so an empty browser type falls back to the
// extension. A reported non-contract type is still trusted as a rejection.
const EXTENSION_TO_TYPE: Record<string, AcceptedContentType> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
}

/** Structural params, not DOM File: domain stays DOM-free. */
export function resolveContentType(file: {
  name: string
  type: string
}): AcceptedContentType | undefined {
  const reported = ACCEPTED_CONTENT_TYPES.find((type) => type === file.type)
  if (reported) return reported
  if (file.type !== '') return undefined
  const extension = file.name.includes('.')
    ? file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
    : ''
  return EXTENSION_TO_TYPE[extension]
}

export type FileRejection = 'rejected_type' | 'rejected_size'

export function rejectFile(file: {
  name: string
  type: string
  size: number
}): FileRejection | undefined {
  if (resolveContentType(file) === undefined) return 'rejected_type'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'rejected_size'
  return undefined
}

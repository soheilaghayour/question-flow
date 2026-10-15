/** Contract limits (README): PDF, DOCX, PNG, JPG up to 5 MB — question prose
 * never changes them (DECISIONS #9). */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
] as const

export type FileRejection = 'rejected_type' | 'rejected_size'

/** Structural param, not DOM File: domain stays DOM-free. */
export function rejectFile(file: { type: string; size: number }): FileRejection | undefined {
  if (!ACCEPTED_CONTENT_TYPES.some((type) => type === file.type)) return 'rejected_type'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'rejected_size'
  return undefined
}

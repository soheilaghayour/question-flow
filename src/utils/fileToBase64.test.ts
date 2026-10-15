import { expect, it } from 'vitest'
import { fileToBase64 } from './fileToBase64'

// "hello" → "aGVsbG8=" is a known-good base64 pair; the payload contract
// requires plain base64 without the data:<mime>;base64, prefix (bite #2).
it('encodes a file to plain base64 without the data-URL prefix', async () => {
  const file = new File(['hello'], 'hello.pdf', { type: 'application/pdf' })
  await expect(fileToBase64(file)).resolves.toBe('aGVsbG8=')
})

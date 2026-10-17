import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import * as build from '@/domain/testBuilders'
import { fileToBase64 } from '@/utils/fileToBase64'
import { FileQuestion } from './FileQuestion'

// Spy wrapper keeping the real implementation: most tests read real files,
// the race/failure tests override a single call.
vi.mock('@/utils/fileToBase64', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/fileToBase64')>()
  return { fileToBase64: vi.fn(actual.fileToBase64) }
})
const mockFileToBase64 = vi.mocked(fileToBase64)

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

const question = build.file({ question: 'Upload your CV' })

describe('FileQuestion', () => {
  it('accepts exactly the four contract types, whatever the question prose says', () => {
    render(
      <FileQuestion
        question={build.file({ question: 'Bitte ausschließlich als PDF!' })}
        value={null}
        onChange={() => {}}
      />,
      { wrapper },
    )
    const input = screen.getByLabelText('Bitte ausschließlich als PDF!')
    const accept = input.getAttribute('accept') ?? ''
    expect(accept).toContain('application/pdf')
    expect(accept).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    expect(accept).toContain('image/png')
    expect(accept).toContain('image/jpeg')
  })

  it('emits the contract file value: plain base64 data, no data-URL prefix', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const pdf = new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Upload your CV'), pdf)
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith({
        content_type: 'application/pdf',
        // btoa('%PDF') — a worked example, independent of fileToBase64.
        data: 'JVBERg==',
        file_name: 'cv.pdf',
      }),
    )
  })

  // The visible control must stay a drop target: the native input (the
  // original one) is visually hidden and unreachable by mouse.
  it('accepts a file dropped onto the control and re-validates it', async () => {
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const pdf = new File(['%PDF'], 'dropped.pdf', { type: 'application/pdf' })
    fireEvent.drop(screen.getByRole('button', { name: 'Choose file' }), {
      dataTransfer: { files: [pdf] },
    })
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ file_name: 'dropped.pdf' }),
      ),
    )
  })

  it('rejects a dropped file of a disallowed type', () => {
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const exe = new File(['MZ'], 'virus.exe', { type: 'application/x-msdownload' })
    fireEvent.drop(screen.getByRole('button', { name: 'Choose file' }), {
      dataTransfer: { files: [exe] },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Only PDF, DOCX, PNG or JPG files are accepted',
    )
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('marks the visible Choose file button invalid while the question has an error', () => {
    render(<FileQuestion question={question} value={null} onChange={() => {}} />, { wrapper })
    const button = screen.getByRole('button', { name: 'Choose file' })
    expect(button).not.toHaveAttribute('data-invalid')
    fireEvent.drop(button, {
      dataTransfer: { files: [new File(['MZ'], 'virus.exe', { type: 'application/x-msdownload' })] },
    })
    expect(button).toHaveAttribute('data-invalid')
  })

  it('rejects a disallowed type with a clear message and emits null', async () => {
    // applyAccept off: drag & drop and "All files" pickers bypass the accept filter.
    const user = userEvent.setup({ applyAccept: false })
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const txt = new File(['notes'], 'notes.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('Upload your CV'), txt)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Only PDF, DOCX, PNG or JPG files are accepted',
    )
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('rejects a file over 5 MB with a message naming the limit and emits null', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.pdf', {
      type: 'application/pdf',
    })
    await user.upload(screen.getByLabelText('Upload your CV'), big)
    expect(screen.getByRole('alert')).toHaveTextContent('The file is larger than 5 MB')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('accepts a file of exactly 5 MB', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const atLimit = new File([new Uint8Array(5 * 1024 * 1024)], 'cv.pdf', {
      type: 'application/pdf',
    })
    await user.upload(screen.getByLabelText('Upload your CV'), atLimit)
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ file_name: 'cv.pdf' }),
      ),
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('uses the extension to fill content_type when the browser reports none', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onChange = vi.fn()
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const docx = new File(['word'], 'cv.docx', { type: '' })
    await user.upload(screen.getByLabelText('Upload your CV'), docx)
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          content_type:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          file_name: 'cv.docx',
        }),
      ),
    )
  })

  it('resets the native input after a selection so the same file can be re-picked', async () => {
    const user = userEvent.setup()
    render(<FileQuestion question={question} value={null} onChange={() => {}} />, { wrapper })
    const input = screen.getByLabelText<HTMLInputElement>('Upload your CV')
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.pdf', {
      type: 'application/pdf',
    })
    await user.upload(input, big)
    // A compressed file under the same name must fire a fresh change event —
    // browsers skip it when the input's value string is unchanged.
    expect(input.value).toBe('')
  })

  it('ignores a slow read that resolves after a newer selection (latest wins)', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onChange = vi.fn()
    let resolveSlowRead: (data: string) => void = () => {}
    mockFileToBase64.mockImplementationOnce(
      () => new Promise((resolve) => (resolveSlowRead = resolve)),
    )
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    const input = screen.getByLabelText('Upload your CV')

    await user.upload(input, new File(['%PDF'], 'slow.pdf', { type: 'application/pdf' }))
    await user.upload(input, new File(['notes'], 'notes.txt', { type: 'text/plain' }))
    expect(onChange).toHaveBeenLastCalledWith(null)

    resolveSlowRead('JVBERg==')
    await Promise.resolve()
    // The replaced selection must not overwrite the rejection that follows it.
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Only PDF, DOCX, PNG or JPG files are accepted',
    )
  })

  it('shows a read error and clears the answer when the file cannot be read', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    mockFileToBase64.mockRejectedValueOnce(new Error('NotReadableError'))
    render(<FileQuestion question={question} value={null} onChange={onChange} />, { wrapper })
    await user.upload(
      screen.getByLabelText('Upload your CV'),
      new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The file could not be read. Please try again',
    )
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('shows the already-chosen file name', () => {
    render(
      <FileQuestion
        question={question}
        value={{ content_type: 'application/pdf', data: 'JVBERg==', file_name: 'cv.pdf' }}
        onChange={() => {}}
      />,
      { wrapper },
    )
    expect(screen.getByText('cv.pdf')).toBeInTheDocument()
  })

  it('shows the error passed from the flow', () => {
    render(
      <FileQuestion
        question={question}
        value={null}
        onChange={() => {}}
        error="This field is required"
      />,
      { wrapper },
    )
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })
})

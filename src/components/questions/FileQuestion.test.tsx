import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import * as build from '@/domain/testBuilders'
import { FileQuestion } from './FileQuestion'

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

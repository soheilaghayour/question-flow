import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import * as build from '@/domain/testBuilders'
import { NumericQuestion } from './NumericQuestion'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('NumericQuestion', () => {
  it('renders a text input with a numeric keyboard, never type="number"', () => {
    render(<NumericQuestion question={build.numeric()} value={null} onChange={() => {}} />, {
      wrapper,
    })
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('inputmode', 'numeric')
  })

  it('shows the current answer', () => {
    render(<NumericQuestion question={build.numeric()} value={85000} onChange={() => {}} />, {
      wrapper,
    })
    expect(screen.getByRole('textbox')).toHaveValue('85000')
  })

  it('parses German grouping: typing 85.000 emits 85000', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumericQuestion question={build.numeric()} value={null} onChange={onChange} />, {
      wrapper,
    })
    await user.type(screen.getByRole('textbox'), '85.000')
    expect(onChange).toHaveBeenLastCalledWith(85000)
  })

  it('never blocks typing: non-numeric text stays visible and emits null', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <NumericQuestion
        question={build.numeric({ min: 0, max: 100 })}
        value={null}
        onChange={onChange}
      />,
      { wrapper },
    )
    const input = screen.getByRole('textbox')
    await user.type(input, 'abc')
    expect(input).toHaveValue('abc')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  // A parse failure must not name the bounds: on questions without a
  // configured range they are schema defaults (0–100000000) the job never set.
  it('shows a plain whole-number error for unparseable input, without bounds', async () => {
    const user = userEvent.setup()
    render(
      <NumericQuestion question={build.numeric()} value={null} onChange={() => {}} />,
      { wrapper },
    )
    await user.type(screen.getByRole('textbox'), '85,5')
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Enter a whole number')
    expect(alert).not.toHaveTextContent('100000000')
  })

  it('rejects an out-of-range value with an error naming the bounds', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <NumericQuestion
        question={build.numeric({ min: 0, max: 100 })}
        value={null}
        onChange={onChange}
      />,
      { wrapper },
    )
    await user.type(screen.getByRole('textbox'), '200')
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a whole number between 0 and 100',
    )
  })

  it('emits null for a cleared input, without an error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumericQuestion question={build.numeric()} value={42} onChange={onChange} />, {
      wrapper,
    })
    await user.clear(screen.getByRole('textbox'))
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // The seam promises a controlled component: an external value change
  // (reset, post-mount prefill) must reach the display.
  it('re-syncs the displayed text when the value prop changes externally', () => {
    const { rerender } = render(
      <NumericQuestion question={build.numeric()} value={42} onChange={() => {}} />,
      { wrapper },
    )
    rerender(<NumericQuestion question={build.numeric()} value={7} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('7')
  })

  it('keeps the raw text while typing, when re-renders echo the emitted value', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <NumericQuestion question={build.numeric()} value={null} onChange={() => {}} />,
      { wrapper },
    )
    await user.type(screen.getByRole('textbox'), '85.')
    // The parent stored null (unparseable) and re-renders with it — the
    // half-typed text must not be wiped mid-entry.
    rerender(<NumericQuestion question={build.numeric()} value={null} onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('85.')
  })

  it('shows the error passed from the flow when the input itself is fine', () => {
    render(
      <NumericQuestion
        question={build.numeric()}
        value={null}
        onChange={() => {}}
        error="This field is required"
      />,
      { wrapper },
    )
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })
})

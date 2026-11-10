import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import * as build from '@/test/testBuilders'
import { DateQuestion } from './DateQuestion'

// TZ fixed for the whole file: the min-attribute test needs a timezone behind
// UTC, where late-evening local time already IS tomorrow in UTC — exactly
// where a toISOString() implementation shifts the date (bite #3).
beforeAll(() => {
  vi.stubEnv('TZ', 'America/New_York')
})

afterAll(() => {
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DateQuestion', () => {
  it('renders a native date input labelled with the question text', () => {
    render(
      <DateQuestion
        question={build.date({ question: 'Earliest starting date?' })}
        value={null}
        onChange={() => {}}
      />,
    )
    expect(screen.getByLabelText('Earliest starting date?')).toHaveAttribute('type', 'date')
  })

  it('sets min to today from LOCAL date parts, not the UTC date', () => {
    // Local: 31 March, 23:30 in New York — in UTC that is already 1 April.
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 31, 23, 30))
    render(<DateQuestion question={build.date()} value={null} onChange={() => {}} />)
    expect(screen.getByLabelText('Q?')).toHaveAttribute('min', '2026-03-31')
  })

  it('pads single-digit month and day in min', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 5))
    render(<DateQuestion question={build.date()} value={null} onChange={() => {}} />)
    expect(screen.getByLabelText('Q?')).toHaveAttribute('min', '2026-04-05')
  })

  it('shows the current answer and emits a picked date', () => {
    const onChange = vi.fn()
    render(<DateQuestion question={build.date()} value="2026-11-01" onChange={onChange} />)
    const input = screen.getByLabelText('Q?')
    expect(input).toHaveValue('2026-11-01')
    fireEvent.change(input, { target: { value: '2026-12-24' } })
    expect(onChange).toHaveBeenLastCalledWith('2026-12-24')
  })

  it('emits null when the date is cleared', () => {
    const onChange = vi.fn()
    render(<DateQuestion question={build.date()} value="2026-11-01" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Q?'), { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('shows the error passed from the flow', () => {
    render(
      <DateQuestion
        question={build.date()}
        value={null}
        onChange={() => {}}
        error="This field is required"
      />,
    )
    expect(screen.getByLabelText('Q?')).toHaveAccessibleDescription('This field is required')
  })
})

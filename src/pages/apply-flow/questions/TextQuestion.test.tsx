import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as build from '@/test/testBuilders'
import { TextQuestion } from './TextQuestion'

describe('TextQuestion', () => {
  it('renders a single-line input labelled with the question text', () => {
    render(
      <TextQuestion
        question={build.text({ question: 'Why do you apply?' })}
        value={null}
        onChange={() => {}}
      />,
    )
    const input = screen.getByLabelText('Why do you apply?')
    expect(input.tagName).toBe('INPUT')
  })

  it('renders a textarea when multiline', () => {
    render(
      <TextQuestion
        question={build.text({ question: 'Tell us more', multiline: true })}
        value={null}
        onChange={() => {}}
      />,
    )
    expect(screen.getByLabelText('Tell us more').tagName).toBe('TEXTAREA')
  })

  it('emits typed text', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextQuestion question={build.text()} value={null} onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenLastCalledWith('a')
  })

  it('emits null when the input is cleared', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextQuestion question={build.text()} value="abc" onChange={onChange} />)
    await user.clear(screen.getByRole('textbox'))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('shows the error passed from the flow', () => {
    render(
      <TextQuestion
        question={build.text()}
        value={null}
        onChange={() => {}}
        error="This field is required"
      />,
    )
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('This field is required')
  })
})

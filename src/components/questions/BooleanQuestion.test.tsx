import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import * as build from '@/domain/testBuilders'
import { BooleanQuestion } from './BooleanQuestion'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider language="en">{children}</LanguageProvider>
)

describe('BooleanQuestion', () => {
  it('renders explicit Yes/No radios grouped under the question text', () => {
    render(
      <BooleanQuestion
        question={build.boolean({ question: 'Are you authorized to work in Germany?' })}
        value={null}
        onChange={() => {}}
      />,
      { wrapper },
    )
    const group = screen.getByRole('group', { name: 'Are you authorized to work in Germany?' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'No' })).toBeInTheDocument()
  })

  it('checks neither radio without an answer — a required boolean has no default', () => {
    render(<BooleanQuestion question={build.boolean()} value={null} onChange={() => {}} />, {
      wrapper,
    })
    expect(screen.getByRole('radio', { name: 'Yes' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'No' })).not.toBeChecked()
  })

  it('shows false as a real answer, not as unanswered', () => {
    render(<BooleanQuestion question={build.boolean()} value={false} onChange={() => {}} />, {
      wrapper,
    })
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Yes' })).not.toBeChecked()
  })

  it('emits true for Yes and false for No', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BooleanQuestion question={build.boolean()} value={null} onChange={onChange} />, {
      wrapper,
    })
    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    expect(onChange).toHaveBeenLastCalledWith(true)
    await user.click(screen.getByRole('radio', { name: 'No' }))
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('announces the error and ties it to the group', () => {
    render(
      <BooleanQuestion
        question={build.boolean()}
        value={null}
        onChange={() => {}}
        error="This field is required"
      />,
      { wrapper },
    )
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
    expect(screen.getByRole('group')).toHaveAccessibleDescription('This field is required')
  })
})

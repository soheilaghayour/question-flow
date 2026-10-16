import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import type { Question } from '@/domain/schema'
import * as build from '@/domain/testBuilders'
import { QuestionField } from './QuestionField'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider language="en">{children}</LanguageProvider>
)

describe('QuestionField', () => {
  // The whole point of the dispatch: a plain Question union renders without
  // casts or switches at the call site — this test would not compile otherwise.
  it('renders the matching widget for each member of a Question[] union', () => {
    const questions: Question[] = [
      build.text({ id: 'q-text', question: 'Why?' }),
      build.date({ id: 'q-date', question: 'When?' }),
      build.file({ id: 'q-file', question: 'CV?' }),
    ]
    render(
      <>
        {questions.map((question) => (
          <QuestionField key={question.id} question={question} value={null} onChange={() => {}} />
        ))}
      </>,
      { wrapper },
    )
    expect(screen.getByLabelText('Why?').tagName).toBe('INPUT')
    expect(screen.getByLabelText('When?')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('CV?')).toHaveAttribute('type', 'file')
  })

  it('passes answers and errors through to the widget', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const question: Question = build.boolean({ question: 'Authorized?' })
    render(
      <QuestionField question={question} value={null} onChange={onChange} error="Required" />,
      { wrapper },
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    expect(onChange).toHaveBeenLastCalledWith(true)
  })
})

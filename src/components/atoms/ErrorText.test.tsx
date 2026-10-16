import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorText } from './ErrorText'

describe('ErrorText', () => {
  it('is announced as an alert', () => {
    render(<ErrorText>Required</ErrorText>)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('keeps a layout className next to the error styling', () => {
    render(<ErrorText className="self-start">Required</ErrorText>)
    expect(screen.getByRole('alert')).toHaveClass('text-error', 'self-start')
  })
})

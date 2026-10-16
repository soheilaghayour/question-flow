import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorText } from './ErrorText'

describe('ErrorText', () => {
  it('is announced as an alert', () => {
    render(<ErrorText>Required</ErrorText>)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })
})

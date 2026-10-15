import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SubmissionResult } from './SubmissionResult'

describe('SubmissionResult', () => {
  it('shows a large decorative check icon above the confirmation', () => {
    render(<SubmissionResult title="Thanks!" body="We received your application." />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('size-12')
  })
})

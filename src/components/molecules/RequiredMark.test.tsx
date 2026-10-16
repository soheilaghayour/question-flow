import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { RequiredMark } from './RequiredMark'

describe('RequiredMark', () => {
  it('shows a star hidden from screen readers', () => {
    const { container } = render(<RequiredMark />)
    const star = container.firstElementChild
    expect(star).toHaveTextContent('*')
    expect(star).toHaveAttribute('aria-hidden', 'true')
  })
})

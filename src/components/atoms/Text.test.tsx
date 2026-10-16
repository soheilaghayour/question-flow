import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('renders the element passed via as', () => {
    render(
      <dl>
        <Text as="dt">Term</Text>
      </dl>,
    )
    expect(screen.getByText('Term').tagName).toBe('DT')
  })

  it('keeps a caller className next to its own', () => {
    render(
      <Text tone="muted" className="self-start">
        Hello
      </Text>,
    )
    expect(screen.getByText('Hello')).toHaveClass('self-start')
  })
})

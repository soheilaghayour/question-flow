import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('maps tone and size to role classes', () => {
    render(
      <Text tone="muted" size="sm">
        Hello
      </Text>,
    )
    expect(screen.getByText('Hello')).toHaveClass('text-muted', 'text-sm')
  })

  it('renders default tone and size without role classes', () => {
    render(<Text>Hello</Text>)
    expect(screen.getByText('Hello')).not.toHaveClass('text-muted', 'text-sm')
  })

  it('keeps a layout className next to the role classes', () => {
    render(
      <Text tone="muted" className="self-start">
        Hello
      </Text>,
    )
    expect(screen.getByText('Hello')).toHaveClass('text-muted', 'self-start')
  })
})

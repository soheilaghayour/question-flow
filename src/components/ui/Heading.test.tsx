import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders the heading level passed in', () => {
    render(<Heading level={3}>Title</Heading>)
    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toBeInTheDocument()
  })

  it('forwards native props and a caller className', () => {
    render(
      <Heading level={2} id="title" className="self-start">
        Title
      </Heading>,
    )
    const heading = screen.getByRole('heading', { name: 'Title' })
    expect(heading).toHaveAttribute('id', 'title')
    expect(heading).toHaveClass('self-start')
  })
})

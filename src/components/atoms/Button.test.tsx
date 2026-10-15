import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { FunctionComponent, SVGProps } from 'react'
import { Button } from './Button'

// Globbed, not listed: a newly added icon asset is covered without editing this test.
const ICON_MODULES = import.meta.glob<{ default: FunctionComponent<SVGProps<SVGSVGElement>> }>(
  './icons/*.svg',
  { query: '?react', eager: true },
)
const ICONS = Object.entries(ICON_MODULES).map(([path, module]) => [path, module.default] as const)

describe('Button', () => {
  it('finds the icon assets', () => {
    expect(ICONS.length).toBeGreaterThan(0)
  })

  it.each(ICONS)('renders %s inline, text-colored and hidden from its accessible name', (_, Icon) => {
    render(
      <Button aria-label="Back">
        <Icon />
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Back' })
    const svg = button.firstElementChild
    expect(svg?.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })
})

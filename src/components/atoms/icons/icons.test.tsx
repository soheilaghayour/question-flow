import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import type { FunctionComponent, SVGProps } from 'react'
import ArrowLeftIcon from './arrow-left.svg?react'
import ArrowRightIcon from './arrow-right.svg?react'
import CheckCircleIcon from './check-circle.svg?react'
import GlobeIcon from './globe.svg?react'

const ICONS: [string, FunctionComponent<SVGProps<SVGSVGElement>>, string][] = [
  ['arrow-left', ArrowLeftIcon, 'size-5'],
  ['arrow-right', ArrowRightIcon, 'size-5'],
  ['check-circle', CheckCircleIcon, 'size-12'],
  ['globe', GlobeIcon, 'size-5'],
]

describe('svg icon assets', () => {
  it.each(ICONS)('%s renders as an inline, decorative, text-colored svg', (_, Icon, size) => {
    const { container } = render(<Icon />)
    const svg = container.firstElementChild
    expect(svg?.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveClass(size)
  })
})

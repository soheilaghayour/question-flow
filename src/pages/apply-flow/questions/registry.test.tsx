import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import * as build from '@/test/testBuilders'
import { questionRegistry } from './registry'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('questionRegistry', () => {
  it('contains exactly the 6 contract types', () => {
    expect(Object.keys(questionRegistry).sort()).toEqual([
      'boolean',
      'date',
      'file',
      'numeric',
      'select',
      'text',
    ])
  })

  // One type-specific assertion per entry: a swapped mapping must fail, not
  // just a missing key.
  it('maps every type to its component', () => {
    const noop = () => {}

    const Text = questionRegistry.text
    const { unmount: unmountText } = render(
      <Text question={build.text({ multiline: true })} value={null} onChange={noop} />,
      { wrapper },
    )
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
    unmountText()

    const Numeric = questionRegistry.numeric
    const { unmount: unmountNumeric } = render(
      <Numeric question={build.numeric()} value={null} onChange={noop} />,
      { wrapper },
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric')
    unmountNumeric()

    const DateComponent = questionRegistry.date
    const { unmount: unmountDate } = render(
      <DateComponent question={build.date()} value={null} onChange={noop} />,
      { wrapper },
    )
    expect(screen.getByLabelText('Q?')).toHaveAttribute('type', 'date')
    unmountDate()

    const Boolean = questionRegistry.boolean
    const { unmount: unmountBoolean } = render(
      <Boolean question={build.boolean()} value={null} onChange={noop} />,
      { wrapper },
    )
    expect(screen.getByRole('radio', { name: 'Yes' })).toBeInTheDocument()
    unmountBoolean()

    const Select = questionRegistry.select
    const { unmount: unmountSelect } = render(
      <Select question={build.select({ max_choices: 2 })} value={null} onChange={noop} />,
      { wrapper },
    )
    expect(screen.getByRole('checkbox', { name: 'B1' })).toBeInTheDocument()
    unmountSelect()

    const FileComponent = questionRegistry.file
    render(<FileComponent question={build.file()} value={null} onChange={noop} />, { wrapper })
    expect(screen.getByLabelText('Q?')).toHaveAttribute('type', 'file')
  })
})

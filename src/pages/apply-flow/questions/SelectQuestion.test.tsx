import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as build from '@/test/testBuilders'
import { SelectQuestion } from './SelectQuestion'

const LEVELS = [
  { label: 'B1', value: 'b1' },
  { label: 'B2', value: 'b2' },
  { label: 'C1', value: 'c1' },
]

const single = build.select({ question: 'German level?', options: LEVELS, max_choices: 1 })
const multi = build.select({ question: 'German level?', options: LEVELS, max_choices: 2 })

describe('SelectQuestion with max_choices 1', () => {
  it('renders one radio per option, grouped under the question text', () => {
    render(<SelectQuestion question={single} value={null} onChange={() => {}} />)
    expect(screen.getByRole('group', { name: 'German level?' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: 'B2' })).not.toBeChecked()
  })

  it('checks the picked option and emits a plain string', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SelectQuestion question={single} value="b1" onChange={onChange} />)
    expect(screen.getByRole('radio', { name: 'B1' })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: 'C1' }))
    expect(onChange).toHaveBeenLastCalledWith('c1')
  })
})

describe('SelectQuestion with max_choices > 1', () => {
  it('renders checkboxes even when only one option is picked — shape follows max_choices', () => {
    render(<SelectQuestion question={multi} value={['b1']} onChange={() => {}} />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    expect(screen.getByRole('checkbox', { name: 'B1' })).toBeChecked()
  })

  it('emits the accumulated array when another box is checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SelectQuestion question={multi} value={['b1']} onChange={onChange} />)
    await user.click(screen.getByRole('checkbox', { name: 'B2' }))
    expect(onChange).toHaveBeenLastCalledWith(['b1', 'b2'])
  })

  it('disables only the unchecked boxes once the cap is reached', () => {
    render(<SelectQuestion question={multi} value={['b1', 'b2']} onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'C1' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'B1' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'B2' })).toBeEnabled()
  })

  it('leaves every box enabled below the cap', () => {
    render(<SelectQuestion question={multi} value={['b1']} onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { name: 'B2' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'C1' })).toBeEnabled()
  })

  it('emits the reduced array on uncheck', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SelectQuestion question={multi} value={['b1', 'b2']} onChange={onChange} />)
    await user.click(screen.getByRole('checkbox', { name: 'B2' }))
    expect(onChange).toHaveBeenLastCalledWith(['b1'])
  })

  it('emits null when the last pick is removed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SelectQuestion question={multi} value={['b1']} onChange={onChange} />)
    await user.click(screen.getByRole('checkbox', { name: 'B1' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('announces the error and ties it to the group', () => {
    render(
      <SelectQuestion question={multi} value={null} onChange={() => {}} error="Pick at least one" />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Pick at least one')
    expect(screen.getByRole('group')).toHaveAccessibleDescription('Pick at least one')
  })
})

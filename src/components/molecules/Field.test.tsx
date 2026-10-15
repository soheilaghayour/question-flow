import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/atoms/Input'
import { Field } from './Field'

describe('Field', () => {
  it('focuses the input when its label is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Field id="salary" label="Salary expectation">
        {(inputProps) => <Input {...inputProps} />}
      </Field>,
    )
    await user.click(screen.getByText('Salary expectation'))
    expect(screen.getByRole('textbox')).toHaveFocus()
  })

  it('marks an invalid field and ties the error text to the input', () => {
    render(
      <Field id="salary" label="Salary expectation" error="Enter a number between 0 and 100">
        {(inputProps) => <Input {...inputProps} />}
      </Field>,
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    // Asserts the aria-describedby association end-to-end, not the id plumbing.
    expect(input).toHaveAccessibleDescription('Enter a number between 0 and 100')
  })

  it('exposes neither aria-invalid nor a description without an error', () => {
    render(
      <Field id="salary" label="Salary expectation">
        {(inputProps) => <Input {...inputProps} />}
      </Field>,
    )
    const input = screen.getByRole('textbox')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveAccessibleDescription('')
  })
})

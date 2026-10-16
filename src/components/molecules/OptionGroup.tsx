import type { ReactNode } from 'react'
import { Text } from '@/components/atoms/Text'
import { ErrorText } from './ErrorText'
import { RequiredMark } from './RequiredMark'

interface OptionGroupProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

export function OptionGroup({ id, label, required, error, children }: OptionGroupProps) {
  const errorId = `${id}-error`
  // No aria-required: the group role doesn't support it.
  return (
    <fieldset id={id} aria-describedby={error ? errorId : undefined} className="flex flex-col gap-1">
      <legend>
        <span className="inline-flex items-center gap-1">
          <Text as="span" weight="medium">
            {label}
          </Text>
          {required && <RequiredMark />}
        </span>
      </legend>
      <div className="flex flex-col gap-2">{children}</div>
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </fieldset>
  )
}

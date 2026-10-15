import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { profile } from '@/data'
import shortJson from '@jobs/short.json'
import { JobPage } from './JobPage'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('JobPage', () => {
  it('labels an unnormalizable config via i18n, not a hardcoded string', () => {
    render(<JobPage configs={[shortJson, { broken: true }]} profile={profile} appliedJobIds={[]} onApply={() => {}} />, { wrapper })
    expect(screen.getByRole('button', { name: 'Invalid job' })).toBeInTheDocument()
  })

  it('shows the error state when the selected config is invalid', () => {
    render(<JobPage configs={[{ broken: true }]} profile={profile} appliedJobIds={[]} onApply={() => {}} />, { wrapper })
    expect(screen.getByRole('alert')).toHaveTextContent('This job posting cannot be displayed.')
  })
})

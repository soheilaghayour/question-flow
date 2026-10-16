import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import type * as DataModule from '@/data'
import shortJson from '@jobs/short.json'
import { renderRoute } from '@/test/renderRoute'

vi.mock('@/data', async (importOriginal) => ({
  ...(await importOriginal<typeof DataModule>()),
  rawJobConfigsById: new Map<string, unknown>([
    ['job-short', shortJson],
    ['job-broken', { id: 'job-broken', broken: true }],
  ]),
}))

describe('JobPage', () => {
  it('labels an unnormalizable config via i18n, not a hardcoded string', () => {
    renderRoute('/jobs/job-short')
    expect(screen.getByRole('button', { name: 'Invalid job' })).toBeInTheDocument()
  })

  it('shows the error state when the selected config is invalid', () => {
    renderRoute('/jobs/job-broken')
    expect(screen.getByRole('alert')).toHaveTextContent('This job posting cannot be displayed.')
  })
})

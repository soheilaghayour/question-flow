import { Navigate, type RouteObject } from 'react-router'
import { rawJobConfigsById } from '@/data'
import { App } from '@/App'
import { JobPage } from '@/pages/JobPage'
import { ApplyFlow } from '@/pages/ApplyFlow'
import { SubmitConfirmation } from '@/pages/SubmitConfirmation'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import type { Language } from '@/i18n/context'
import { pathInLanguage } from '@/i18n/languagePath'

const firstJobPath = `/jobs/${rawJobConfigsById.keys().next().value}`

function pageRoutes(language: Language): RouteObject[] {
  const firstJob = <Navigate to={pathInLanguage(language, firstJobPath)} replace />
  return [
    { index: true, element: firstJob },
    { path: 'jobs/:jobId', element: <JobPage /> },
    { path: 'jobs/:jobId/apply', element: <ApplyFlow /> },
    { path: 'jobs/:jobId/confirmation', element: <SubmitConfirmation /> },
    { path: '*', element: firstJob },
  ]
}

// Both parents render the same element tree, so a language switch keeps the
// page mounted — the wizard's answers survive it.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LanguageProvider language="en">
        <App />
      </LanguageProvider>
    ),
    children: pageRoutes('en'),
  },
  {
    path: '/de',
    element: (
      <LanguageProvider language="de">
        <App />
      </LanguageProvider>
    ),
    children: pageRoutes('de'),
  },
]

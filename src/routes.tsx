import { Navigate, type RouteObject } from 'react-router'
import { rawJobConfigsById } from '@/data'
import { App } from '@/App'
import { JobOverviewPage } from '@/pages/JobOverviewPage'
import { ApplyFlow } from '@/pages/ApplyFlow'
import { SubmitConfirmation } from '@/pages/SubmitConfirmation'
import { LanguageProvider } from '@/i18n/LanguageProvider'

const firstJob = <Navigate to={`/jobs/${rawJobConfigsById.keys().next().value}`} replace />

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LanguageProvider>
        <App />
      </LanguageProvider>
    ),
    children: [
      { index: true, element: firstJob },
      { path: 'jobs/:jobId', element: <JobOverviewPage /> },
      { path: 'jobs/:jobId/apply', element: <ApplyFlow /> },
      { path: 'jobs/:jobId/confirmation', element: <SubmitConfirmation /> },
      { path: '*', element: firstJob },
    ],
  },
]

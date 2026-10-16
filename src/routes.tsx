import { Navigate, type RouteObject } from 'react-router'
import { rawJobConfigsById } from '@/data'
import { App } from '@/App'
import { JobPage } from '@/pages/JobPage'
import { ApplyFlow } from '@/pages/ApplyFlow'
import { ApplyConfirmation } from '@/pages/ApplyConfirmation'

const firstJobId = rawJobConfigsById.keys().next().value

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      { path: '/', element: <Navigate to={`/jobs/${firstJobId}`} replace /> },
      { path: '/jobs/:jobId', element: <JobPage /> },
      { path: '/jobs/:jobId/apply', element: <ApplyFlow /> },
      { path: '/jobs/:jobId/confirmation', element: <ApplyConfirmation /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { AppProviders } from '@/AppProviders'
import { routes } from '@/routes'

/** Renders the app at `path` on an in-memory router; returns the router so tests can go Back. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<AppProviders router={router} />)
  return router
}

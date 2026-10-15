import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { routes } from '@/routes'

/** Renders the app at `path` on an in-memory router; returns the router for history moves. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>,
  )
  return router
}

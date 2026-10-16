import { RouterProvider, type DataRouter } from 'react-router'
import { LanguageProvider } from '@/i18n/LanguageProvider'

/** Wraps the routes in what every page needs; the app and the tests pass their own router. */
export function AppProviders({ router }: { router: DataRouter }) {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  )
}

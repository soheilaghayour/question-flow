import { Outlet } from 'react-router'
import { AppHeader } from '@/components/molecules/AppHeader'

export function App() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-6">
      <AppHeader />
      <Outlet />
    </main>
  )
}

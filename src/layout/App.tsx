import { Outlet } from 'react-router'
import { AppHeader } from './AppHeader'

export function App() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Outlet />
      </main>
    </>
  )
}

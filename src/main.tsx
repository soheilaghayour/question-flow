import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import './index.css'
import { AppProviders } from '@/AppProviders'
import { routes } from '@/routes'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders router={createBrowserRouter(routes)} />
  </StrictMode>,
)

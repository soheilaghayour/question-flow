import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  // Applied jobs and the language choice persist in localStorage; a test
  // must never inherit another test's "already applied".
  localStorage.clear()
})

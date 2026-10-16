import { useContext } from 'react'
import { LanguageContext } from './context'

export function useI18n() {
  const value = useContext(LanguageContext)
  if (value === null) throw new Error('useI18n requires a <LanguageProvider>')
  return value
}

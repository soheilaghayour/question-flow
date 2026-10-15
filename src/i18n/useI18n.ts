import { useContext } from 'react'
import { LanguageContext, type LanguageContextValue } from './context'

export function useI18n(): LanguageContextValue {
  const value = useContext(LanguageContext)
  if (value === null) throw new Error('useI18n requires a <LanguageProvider>')
  return value
}

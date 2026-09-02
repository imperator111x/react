import type { ReactNode } from 'react'
import { getThemeCssVariables } from '../lib/themes'

interface WeddingThemeWrapperProps {
  themeId: string | null | undefined
  children: ReactNode
  className?: string
}

export default function WeddingThemeWrapper({
  themeId,
  children,
  className = '',
}: WeddingThemeWrapperProps) {
  return (
    <div className={className} style={getThemeCssVariables(themeId)}>
      {children}
    </div>
  )
}

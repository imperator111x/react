import type { CSSProperties } from 'react'

export type WeddingThemeId = 'gold' | 'sage' | 'blush' | 'navy'

export interface WeddingTheme {
  id: WeddingThemeId
  label: string
  gold: string
  goldDark: string
  blush: string
  sage: string
  sageDark: string
}

export const WEDDING_THEMES: WeddingTheme[] = [
  {
    id: 'gold',
    label: 'Gold & Creme',
    gold: '#c9a96e',
    goldDark: '#a88b4a',
    blush: '#e8d5d0',
    sage: '#8a9a7b',
    sageDark: '#6b7a5e',
  },
  {
    id: 'sage',
    label: 'Salbei',
    gold: '#7a9471',
    goldDark: '#5f7558',
    blush: '#dce6d6',
    sage: '#6b8264',
    sageDark: '#556b4f',
  },
  {
    id: 'blush',
    label: 'Rosé',
    gold: '#c9958a',
    goldDark: '#a8766c',
    blush: '#f2ddd8',
    sage: '#b89a94',
    sageDark: '#9a7d78',
  },
  {
    id: 'navy',
    label: 'Navy & Gold',
    gold: '#c9a96e',
    goldDark: '#a88b4a',
    blush: '#d4dae8',
    sage: '#4a5568',
    sageDark: '#2d3748',
  },
]

export function getWeddingTheme(themeId: string | null | undefined): WeddingTheme {
  return WEDDING_THEMES.find((t) => t.id === themeId) ?? WEDDING_THEMES[0]
}

export function getThemeCssVariables(themeId: string | null | undefined): CSSProperties {
  const theme = getWeddingTheme(themeId)
  return {
    '--color-gold': theme.gold,
    '--color-gold-dark': theme.goldDark,
    '--color-blush': theme.blush,
    '--color-sage': theme.sage,
    '--color-sage-dark': theme.sageDark,
  } as CSSProperties
}

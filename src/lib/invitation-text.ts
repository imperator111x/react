import { de, getDictionary, type Locale } from '../i18n'
import type { Salutation } from '../types/wedding'

export const DEFAULT_INVITATION_TEXT_SINGULAR = de.invitation.defaultSingular as string
export const DEFAULT_INVITATION_TEXT_PLURAL = de.invitation.defaultPlural as string

export function getInvitationText(
  customText: string | null | undefined,
  salutation?: Salutation | null,
  locale: Locale = 'de'
): string {
  if (customText?.trim()) return customText.trim()

  const dict = getDictionary(locale)
  const invitation = dict.invitation as { defaultSingular: string; defaultPlural: string }
  return salutation === 'familie' ? invitation.defaultPlural : invitation.defaultSingular
}

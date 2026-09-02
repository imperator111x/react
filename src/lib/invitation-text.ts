import { de, en, type Locale } from '../i18n'
import type { Salutation } from '../types/wedding'

export const DEFAULT_INVITATION_TEXT_SINGULAR = de.invitation.defaultSingular
export const DEFAULT_INVITATION_TEXT_PLURAL = de.invitation.defaultPlural

export function getInvitationText(
  customText: string | null | undefined,
  salutation?: Salutation | null,
  locale: Locale = 'de'
): string {
  if (customText?.trim()) return customText.trim()

  const dict = locale === 'en' ? en : de
  return salutation === 'familie' ? dict.invitation.defaultPlural : dict.invitation.defaultSingular
}

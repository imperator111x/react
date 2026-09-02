import type { Locale } from '../i18n'
import type { Salutation } from '../types/wedding'

export const DEFAULT_INVITATION_TEXT_SINGULAR =
  'wir laden dich herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn du dabei bist!'

export const DEFAULT_INVITATION_TEXT_PLURAL =
  'wir laden euch herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn ihr dabei seid!'

export function getInvitationText(
  customText: string | null | undefined,
  salutation?: Salutation | null,
  locale: Locale = 'de'
): string {
  if (customText?.trim()) return customText.trim()

  if (locale === 'en') {
    return salutation === 'familie'
      ? 'we warmly invite you to our wedding and would be delighted if you could join us!'
      : 'we warmly invite you to our wedding and would be delighted if you could join us!'
  }

  return salutation === 'familie'
    ? DEFAULT_INVITATION_TEXT_PLURAL
    : DEFAULT_INVITATION_TEXT_SINGULAR
}

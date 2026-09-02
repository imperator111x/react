import type { Salutation } from '../types/wedding'

export const DEFAULT_INVITATION_TEXT_SINGULAR =
  'wir laden dich herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn du dabei bist!'

export const DEFAULT_INVITATION_TEXT_PLURAL =
  'wir laden euch herzlich zu unserer Hochzeit ein und würden uns sehr freuen, wenn ihr dabei seid!'

export function getInvitationText(
  customText: string | null | undefined,
  salutation?: Salutation | null
): string {
  if (customText?.trim()) return customText.trim()
  return salutation === 'familie'
    ? DEFAULT_INVITATION_TEXT_PLURAL
    : DEFAULT_INVITATION_TEXT_SINGULAR
}

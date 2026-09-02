import { MessageCircle } from 'lucide-react'
import Button from './Button'
import { openWhatsAppShare } from '../lib/share'

interface WhatsAppShareButtonProps {
  message: string
  label?: string
  variant?: 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

export default function WhatsAppShareButton({
  message,
  label = 'WhatsApp',
  variant = 'outline',
  size = 'sm',
}: WhatsAppShareButtonProps) {
  return (
    <Button variant={variant} size={size} type="button" onClick={() => openWhatsAppShare(message)}>
      <MessageCircle className="w-4 h-4" />
      {label}
    </Button>
  )
}

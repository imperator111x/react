import { MessageCircle } from 'lucide-react'
import { getWhatsAppShareUrl } from '../lib/share'

interface WhatsAppShareButtonProps {
  message: string
  label?: string
  variant?: 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

const variants = {
  outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-white',
  ghost: 'text-warm-gray hover:text-charcoal hover:bg-cream-dark',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
}

export default function WhatsAppShareButton({
  message,
  label = 'WhatsApp',
  variant = 'outline',
  size = 'sm',
}: WhatsAppShareButtonProps) {
  return (
    <a
      href={getWhatsAppShareUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 ${variants[variant]} ${sizes[size]}`}
    >
      <MessageCircle className="w-4 h-4" aria-hidden />
      {label}
    </a>
  )
}

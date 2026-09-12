import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Download, QrCode } from 'lucide-react'
import Button from './Button'

interface InviteQrCodeProps {
  url: string
  label?: string
  downloadFilename?: string
  hint?: string
}

export default function InviteQrCode({
  url,
  label = 'Einladungslink',
  downloadFilename = 'hochzeit-einladung-qr.png',
  hint = 'Druckt den QR-Code auf Save-the-Date-Karten oder Tischkärtchen – Gäste scannen und landen direkt auf eurer Einladung.',
}: InviteQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 220,
      margin: 2,
      color: { dark: '#2c2c2c', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null))
  }, [url])

  const handleDownload = () => {
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = downloadFilename.endsWith('.png')
      ? downloadFilename
      : `${downloadFilename}.png`
    link.click()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (!dataUrl) return null

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-cream-dark mt-4">
      <div className="text-center">
        <img
          src={dataUrl}
          alt={`QR-Code für ${label}`}
          className="w-[220px] h-[220px] rounded-xl border border-cream-dark bg-white p-2"
        />
        <p className="text-xs text-warm-gray mt-2 flex items-center justify-center gap-1">
          <QrCode className="w-3.5 h-3.5" />
          QR-Code für {label}
        </p>
      </div>
      <div className="text-sm text-warm-gray max-w-sm text-center sm:text-left space-y-3">
        <p>{hint}</p>
        <div className="rounded-xl border border-cream-dark bg-cream/40 px-3 py-2.5 text-left">
          <p className="text-xs font-medium text-charcoal mb-1">Link</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-dark underline underline-offset-2 break-all text-xs sm:text-sm"
          >
            {url}
          </a>
        </div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopiert' : 'Link kopieren'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            QR-Code speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

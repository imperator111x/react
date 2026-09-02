import { useEffect, useState } from 'react'
import { useLocale } from '../context/LocaleContext'

interface CountdownProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const difference = new Date(targetDate).getTime() - Date.now()
  if (difference <= 0) return null

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export default function Countdown({ targetDate }: CountdownProps) {
  const { t } = useLocale()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return <p className="font-serif text-2xl text-gold italic">{t('countdown.past')}</p>
  }

  const units = [
    { value: timeLeft.days, label: t('countdown.days') },
    { value: timeLeft.hours, label: t('countdown.hours') },
    { value: timeLeft.minutes, label: t('countdown.minutes') },
    { value: timeLeft.seconds, label: t('countdown.seconds') },
  ]

  return (
    <div className="flex justify-center gap-4 sm:gap-8">
      {units.map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal tabular-nums">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs sm:text-sm text-warm-gray uppercase tracking-wider mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

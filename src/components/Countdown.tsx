import { useEffect, useState } from 'react'

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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <p className="font-serif text-2xl text-gold italic">Der große Tag ist da!</p>
    )
  }

  const units = [
    { value: timeLeft.days, label: 'Tage' },
    { value: timeLeft.hours, label: 'Stunden' },
    { value: timeLeft.minutes, label: 'Minuten' },
    { value: timeLeft.seconds, label: 'Sekunden' },
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

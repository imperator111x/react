import { Link } from 'react-router-dom'
import {
  Heart,
  Calendar,
  Users,
  Share2,
  Sparkles,
  MapPin,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import Button from '../components/Button'

const features = [
  {
    icon: Heart,
    title: 'Digitale Einladung',
    description:
      'Erstelle eine wunderschöne, personalisierte Hochzeitseinladung mit eurer Geschichte, Locations und allen wichtigen Details.',
  },
  {
    icon: Users,
    title: 'RSVP online',
    description:
      'Gäste können bequem online zu- oder absagen, Begleitpersonen angeben und Nachrichten hinterlassen.',
  },
  {
    icon: Calendar,
    title: 'Countdown & Details',
    description:
      'Zeigt den Countdown bis zum großen Tag, Trauung, Feier und Dresscode – alles an einem Ort.',
  },
  {
    icon: Share2,
    title: 'Einfach teilen',
    description:
      'Teilt euren persönlichen Link per WhatsApp, E-Mail oder Social Media – kein Drucken nötig.',
  },
]

const steps = [
  { step: '1', title: 'Profil erstellen', text: 'Tragt eure Namen, Datum und Locations ein – dauert nur 2 Minuten.' },
  { step: '2', title: 'Einladung teilen', text: 'Sendet den Link an eure Gäste per WhatsApp, E-Mail oder QR-Code.' },
  { step: '3', title: 'Zusagen verwalten', text: 'Behaltet alle RSVPs im Dashboard im Blick – wer kommt, wer nicht.' },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blush/30 via-cream to-cream" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-sage/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gold/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-warm-gray">100% kostenlos · Kein Abo</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl font-semibold text-charcoal leading-tight mb-6">
            Eure digitale
            <br />
            <span className="text-gold italic">Hochzeitseinladung</span>
          </h1>

          <p className="text-lg sm:text-xl text-warm-gray max-w-2xl mx-auto mb-10 leading-relaxed">
            Erstellt in Minuten eine elegante Einladungsseite, auf der eure Gäste
            online zu- und absagen können. Wie bei den Profis – komplett kostenlos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/erstellen">
              <Button size="lg">
                Jetzt kostenlos starten
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/e/demo/g/demo-gast">
              <Button variant="outline" size="lg">
                Demo ansehen
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-warm-gray">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sage" />
              RSVP-Verwaltung
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sage" />
              Countdown-Timer
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sage" />
              Persönlicher Link
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-4">
              Alles für euren großen Tag
            </h2>
            <p className="text-warm-gray text-lg max-w-xl mx-auto">
              Von der Einladung bis zur Gästeliste – alles was ihr braucht, an einem Ort.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl bg-cream hover:bg-cream-dark/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <Icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">{title}</h3>
                <p className="text-warm-gray text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-4">
              In 3 Schritten zur Einladung
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ step, title, text }) => (
              <div key={step} className="relative text-center p-8">
                <div className="w-14 h-14 rounded-full bg-gold text-white font-serif text-2xl font-semibold flex items-center justify-center mx-auto mb-6">
                  {step}
                </div>
                <h3 className="font-serif text-2xl font-semibold text-charcoal mb-3">{title}</h3>
                <p className="text-warm-gray leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/erstellen">
              <Button size="lg">
                Hochzeit erstellen
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Preview mockup */}
      <section className="py-20 bg-charcoal text-cream overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">
                Eure Gäste werden es lieben
              </h2>
              <p className="text-cream/70 text-lg leading-relaxed mb-8">
                Eine elegante Einladungsseite mit Countdown, eurer Liebesgeschichte,
                Location-Details und einfachem RSVP-Formular. Mobil optimiert und
                wunderschön auf jedem Gerät.
              </p>
              <ul className="space-y-4">
                {[
                  'Zu- und Absagen mit einem Klick',
                  'Begleitpersonen angeben',
                  'Allergien & Nachrichten hinterlassen',
                  'Countdown bis zum großen Tag',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-cream/80">
                    <MapPin className="w-4 h-4 text-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-cream rounded-3xl p-8 sm:p-12 text-charcoal shadow-2xl">
                <p className="text-gold text-sm uppercase tracking-widest mb-4 text-center">
                  Wir heiraten
                </p>
                <h3 className="font-serif text-4xl sm:text-5xl font-semibold text-center mb-2">
                  Anna <span className="text-gold italic">&</span> Max
                </h3>
                <p className="text-center text-warm-gray mb-8">15. Juni 2026 · Schloss Belvedere</p>
                <div className="flex justify-center gap-6 mb-8">
                  {[
                    { v: '42', l: 'Tage' },
                    { v: '08', l: 'Std' },
                    { v: '30', l: 'Min' },
                  ].map(({ v, l }) => (
                    <div key={l} className="text-center">
                      <div className="font-serif text-2xl font-semibold">{v}</div>
                      <div className="text-xs text-warm-gray uppercase">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 py-3 rounded-full bg-sage/20 text-sage text-center text-sm font-medium">
                    Zusagen
                  </div>
                  <div className="flex-1 py-3 rounded-full bg-cream-dark text-warm-gray text-center text-sm font-medium">
                    Absagen
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Heart className="w-10 h-10 text-gold fill-gold/20 mx-auto mb-6" />
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold text-charcoal mb-4">
            Bereit für euren großen Tag?
          </h2>
          <p className="text-warm-gray text-lg mb-8">
            Erstellt jetzt eure kostenlose Hochzeitseinladung – in weniger als 5 Minuten.
          </p>
          <Link to="/erstellen">
            <Button size="lg">
              Kostenlos Einladung erstellen
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-6 text-sm text-warm-gray">
            Dashboard-Link verloren?{' '}
            <Link to="/dashboard/wiederherstellen" className="text-gold hover:underline">
              Hier wiederherstellen
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

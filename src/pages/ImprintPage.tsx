import LegalPageLayout from '../components/LegalPageLayout'
import { legalConfig } from '../lib/legal-config'

export default function ImprintPage() {
  const { operator, siteName, siteUrl, lastUpdated } = legalConfig

  return (
    <LegalPageLayout title="Impressum">
      <p className="text-warm-gray text-sm">Stand: {lastUpdated}</p>

      <section>
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          {operator.name}
          <br />
          {operator.addressLines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail:{' '}
          <a href={`mailto:${operator.email}`} className="text-gold hover:underline">
            {operator.email}
          </a>
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>{operator.name}</p>
      </section>

      <section>
        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
          zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
          Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
          Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
      </section>

      <section>
        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter (z. B. Google Maps), auf deren Inhalte wir
          keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für
          die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
        </p>
      </section>

      <section>
        <h2>Urheberrecht</h2>
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf {siteName} ({siteUrl}) unterliegen dem
          deutschen Urheberrecht. Beiträge Dritter (z. B. Gästebucheinträge oder hochgeladene Fotos auf
          Einladungsseiten) sind Inhalte der jeweiligen Nutzer.
        </p>
      </section>

      <section>
        <h2>Hinweis zu Einladungsseiten</h2>
        <p>
          Paare, die mit {siteName} eine Hochzeitseinladung erstellen, sind für die von ihnen eingestellten
          Inhalte (Texte, Bilder, Gästedaten) selbst verantwortlich. {siteName} stellt die technische Plattform
          bereit.
        </p>
      </section>
    </LegalPageLayout>
  )
}

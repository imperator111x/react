import LegalPageLayout from '../components/LegalPageLayout'
import { legalConfig } from '../lib/legal-config'

export default function PrivacyPage() {
  const { operator, siteName, siteUrl, lastUpdated, hosting, database } = legalConfig

  return (
    <LegalPageLayout title="Datenschutzerklärung">
      <p className="text-warm-gray text-sm">Stand: {lastUpdated}</p>

      <section>
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf {siteName} ({siteUrl}) im Sinne der DSGVO:
          <br />
          <br />
          {operator.name}
          <br />
          {operator.addressLines.join(', ')}
          <br />
          E-Mail:{' '}
          <a href={`mailto:${operator.email}`} className="text-gold hover:underline">
            {operator.email}
          </a>
        </p>
      </section>

      <section>
        <h2>2. Überblick</h2>
        <p>
          {siteName} ist ein kostenloses Angebot zur Erstellung digitaler Hochzeitseinladungen. Personenbezogene
          Daten werden nur verarbeitet, soweit dies für den Betrieb, die Registrierung einer Hochzeit, die
          Nutzung von Einladungsseiten oder die Kommunikation mit uns erforderlich ist.
        </p>
      </section>

      <section>
        <h2>3. Hosting (GitHub Pages)</h2>
        <p>
          Diese Website wird über GitHub Pages ({hosting.provider}, {hosting.url}) ausgeliefert. Beim Aufruf
          werden technisch notwendige Daten (z. B. IP-Adresse, Datum/Uhrzeit, Browser-Typ) in Server-Logfiles
          verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem
          sicheren und stabilen Betrieb).
        </p>
      </section>

      <section>
        <h2>4. Datenbank & Speicher (Supabase)</h2>
        <p>
          Hochzeitsprofile, Gästelisten, RSVPs, Galeriebilder und weitere einladungsbezogene Daten werden in
          einer Datenbank bei {database.provider} ({database.url}) gespeichert. Region: {database.region}.
        </p>
        <p>
          <strong>Beim Erstellen einer Hochzeit</strong> verarbeiten wir insbesondere: Namen des Brautpaars,
          E-Mail-Adresse, Termine, Orte, optional Geschichte, Dresscode und hochgeladene Bilder.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag/ vorvertragliche Maßnahmen).
        </p>
        <p>
          <strong>Dashboard-Zugang:</strong> Der Zugang zum Paar-Dashboard erfolgt über einen persönlichen
          Link (Token). Bewahrt diesen Link sicher auf.
        </p>
      </section>

      <section>
        <h2>5. Einladungsseiten & Gästedaten</h2>
        <p>
          Gäste können auf Einladungsseiten RSVPs abgeben, Nachrichten hinterlassen, Musikwünsche einreichen,
          Fotos hochladen oder im Gästebuch schreiben. Diese Daten werden dem jeweiligen Brautpaar zugeordnet
          und von diesem verantwortet. Rechtsgrundlage für die Verarbeitung durch uns: Art. 6 Abs. 1 lit. b
          DSGVO (Bereitstellung der Plattform für das Brautpaar).
        </p>
      </section>

      <section>
        <h2>6. Lokale Speicherung im Browser</h2>
        <p>
          Wir nutzen <strong>localStorage</strong> und <strong>sessionStorage</strong>, z. B. für:
        </p>
        <ul>
          <li>gewählte Sprache auf Einladungsseiten</li>
          <li>Status der Umschlag-Animation (bereits geöffnet)</li>
          <li>bestandene Bot-Prüfung vor der Registrierung</li>
        </ul>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Nutzerfreundlichkeit). Die Daten verbleiben auf Ihrem
          Gerät, bis Sie sie löschen oder der Browser-Speicher geleert wird.
        </p>
      </section>

      <section>
        <h2>7. Google Fonts</h2>
        <p>
          Zur einheitlichen Darstellung laden wir Schriftarten von Google Fonts. Dabei kann Ihre IP-Adresse an
          Google übermittelt werden. Anbieter: Google Ireland Limited. Rechtsgrundlage: Art. 6 Abs. 1 lit. f
          DSGVO.
        </p>
      </section>

      <section>
        <h2>8. Google Maps</h2>
        <p>
          Auf Einladungsseiten können Links zu Google Maps eingebunden sein. Erst beim Anklicken verlassen Sie
          unsere Website und es gelten die Datenschutzbestimmungen von Google.
        </p>
      </section>

      <section>
        <h2>9. Speicherdauer & Löschung</h2>
        <p>
          Hochzeitsdaten werden automatisch ca. 7 Tage nach dem letzten Hochzeitstermin gelöscht (siehe
          technische Konfiguration in der Datenbank). Sie können uns jederzeit zur vorzeitigen Löschung
          kontaktieren.
        </p>
      </section>

      <section>
        <h2>10. Ihre Rechte</h2>
        <p>Sie haben gegenüber uns folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
        <ul>
          <li>Auskunft (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung wenden Sie sich an{' '}
          <a href={`mailto:${operator.email}`} className="text-gold hover:underline">
            {operator.email}
          </a>
          . Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        </p>
      </section>

      <section>
        <h2>11. Kein Tracking</h2>
        <p>
          {siteName} setzt keine Analyse- oder Marketing-Cookies ein und nutzt kein externes Tracking (z. B.
          Google Analytics).
        </p>
      </section>
    </LegalPageLayout>
  )
}

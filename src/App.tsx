import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CookieConsentProvider } from './context/CookieConsentContext'
import CookieBanner from './components/CookieBanner'
import CookieSettingsButton from './components/CookieSettingsButton'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import CreateWeddingPage from './pages/CreateWeddingPage'
import InvitationPage from './pages/InvitationPage'
import DashboardPage from './pages/DashboardPage'
import DashboardRecoverPage from './pages/DashboardRecoverPage'
import SeatingPlanPage from './pages/SeatingPlanPage'
import SuccessPage from './pages/SuccessPage'
import GuestPhotosPage from './pages/GuestPhotosPage'
import PrivacyPage from './pages/PrivacyPage'
import ImprintPage from './pages/ImprintPage'

export default function App() {
  return (
    <CookieConsentProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/erstellen" element={<CreateWeddingPage />} />
            <Route path="/erfolg/:slug" element={<SuccessPage />} />
            <Route path="/datenschutz" element={<PrivacyPage />} />
            <Route path="/impressum" element={<ImprintPage />} />
          </Route>
          <Route path="/e/:slug" element={<InvitationPage />} />
          <Route path="/e/:slug/g/:guestToken" element={<InvitationPage />} />
          <Route path="/e/:slug/tischplan" element={<SeatingPlanPage />} />
          <Route path="/e/:slug/tischplan/g/:guestToken" element={<SeatingPlanPage />} />
          <Route path="/e/:slug/fotos" element={<GuestPhotosPage />} />
          <Route path="/e/:slug/fotos/g/:guestToken" element={<GuestPhotosPage />} />
          <Route path="/dashboard/wiederherstellen" element={<DashboardRecoverPage />} />
          <Route path="/dashboard/:token" element={<DashboardPage />} />
        </Routes>
        <CookieBanner />
        <CookieSettingsButton />
      </BrowserRouter>
    </CookieConsentProvider>
  )
}

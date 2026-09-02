import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import CreateWeddingPage from './pages/CreateWeddingPage'
import InvitationPage from './pages/InvitationPage'
import DashboardPage from './pages/DashboardPage'
import SeatingPlanPage from './pages/SeatingPlanPage'
import SuccessPage from './pages/SuccessPage'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/erstellen" element={<CreateWeddingPage />} />
          <Route path="/erfolg/:slug" element={<SuccessPage />} />
        </Route>
        <Route path="/e/:slug" element={<InvitationPage />} />
        <Route path="/e/:slug/g/:guestToken" element={<InvitationPage />} />
        <Route path="/e/:slug/tischplan" element={<SeatingPlanPage />} />
        <Route path="/e/:slug/tischplan/g/:guestToken" element={<SeatingPlanPage />} />
        <Route path="/dashboard/:token" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

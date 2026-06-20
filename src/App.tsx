import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { Show } from '@clerk/react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { Landing } from './Landing'
import Tool from './Tool'

// Router shell. Two real routes with their own URLs:
//   /      -> Landing (marketing page; anyone)
//   /tool  -> Tool    (the app; signed-in only, else bounced to /)
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavbarWithNav />
        <div className="app-main">
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/tool" element={<ToolRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

function NavbarWithNav() {
  const navigate = useNavigate()
  return (
    <Navbar onHome={() => navigate('/')} onLaunch={() => navigate('/tool')} />
  )
}

function LandingRoute() {
  const navigate = useNavigate()
  return <Landing onLaunch={() => navigate('/tool')} />
}

// Protect the tool route: only signed-in users see it; signed-out users are
// redirected to the landing page.
function ToolRoute() {
  return (
    <>
      <Show when="signed-in">
        <Tool />
      </Show>
      <Show when="signed-out">
        <Navigate to="/" replace />
      </Show>
    </>
  )
}

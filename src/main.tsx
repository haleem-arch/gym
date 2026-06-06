import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HRDashboard from './pages/HRDashboard.tsx'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

const isHR = window.location.pathname === '/hr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isHR ? <HRDashboard /> : <App />}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)

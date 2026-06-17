import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HRDashboard from './pages/HRDashboard.tsx'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import posthog from 'posthog-js'

// Initialize PostHog
posthog.init('phc_wHvGnA2oxS9Kv9wFRSNGSYXNPAiQbSZUyFHmuzDEptcy', {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true
})

const isHR = window.location.pathname === '/hr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isHR ? <HRDashboard /> : <App />}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)

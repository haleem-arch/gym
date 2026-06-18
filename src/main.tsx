import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HRDashboard from './pages/HRDashboard.tsx'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import posthog from 'posthog-js'

// 1. Read initial consent
const getInitialConsent = () => {
  try {
    const saved = localStorage.getItem('lifegym_cookie_consent');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const initialConsent = getInitialConsent();

// 2. Initialize PostHog in opt-out mode by default if replays consent is missing
posthog.init('phc_wHvGnA2oxS9Kv9wFRSNGSYXNPAiQbSZUyFHmuzDEptcy', {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: false, // Prevent tracking pageviews automatically
  opt_out_capturing_by_default: !initialConsent?.replays
});

// Trigger initial pageview if consent is already granted
if (initialConsent?.replays) {
  posthog.capture('$pageview');
}

// 3. Define global helper to handle consent updates in real-time
(window as any).updateLifeGymConsent = (consent: { essential: boolean; analytics: boolean; replays: boolean }) => {
  if (consent.replays) {
    if (posthog.has_opted_out_capturing()) {
      posthog.opt_in_capturing();
    }
    posthog.capture('$pageview');
  } else {
    posthog.opt_out_capturing();
  }

  // Trigger event for VercelConsentWrapper
  window.dispatchEvent(new Event('lifegym_consent_changed'));
};

// 4. Wrapper to dynamically mount/unmount Vercel Analytics based on consent state
const VercelConsentWrapper = () => {
  const [hasAnalytics, setHasAnalytics] = useState(() => {
    const consent = getInitialConsent();
    return !!consent?.analytics;
  });

  useEffect(() => {
    const handleConsentChange = () => {
      const consent = getInitialConsent();
      setHasAnalytics(!!consent?.analytics);
    };

    window.addEventListener('lifegym_consent_changed', handleConsentChange);
    return () => window.removeEventListener('lifegym_consent_changed', handleConsentChange);
  }, []);

  if (!hasAnalytics) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
};

const isHR = window.location.pathname === '/hr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isHR ? <HRDashboard /> : <App />}
    <VercelConsentWrapper />
  </StrictMode>,
)

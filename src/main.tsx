import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HRDashboard from './pages/HRDashboard.tsx'

const isHR = window.location.pathname === '/hr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isHR ? <HRDashboard /> : <App />}
  </StrictMode>,
)

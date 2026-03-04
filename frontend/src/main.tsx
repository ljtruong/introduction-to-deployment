import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getApiBaseUrl, wakeBackend } from '@/api/chat'
import './index.css'
import App from './App.tsx'

// Wake Cloud Run as soon as the app loads (preconnect + health ping).
const apiBase = getApiBaseUrl()
if (apiBase && apiBase.startsWith('http')) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = new URL(apiBase).origin
  document.head.appendChild(link)
}
wakeBackend()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

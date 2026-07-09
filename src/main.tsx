import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, getStoredTheme } from '@/config/Themes'
import '@/styles/global.scss'
import App from './App'

applyTheme(getStoredTheme())

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found in document')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

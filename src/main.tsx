import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { isMockMode } from '@/api/client'
import '@/styles/global.scss'
import App from './App'

if (isMockMode) {
  console.info('[mock] Running without API/DB — data is stored in localStorage')
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root not found in document')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

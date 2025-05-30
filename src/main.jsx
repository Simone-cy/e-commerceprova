import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <StrictMode>
    {/* BrowserRouter per abilitare il routing nell'applicazione */}
    <BrowserRouter>
      {/* Componente principale dell'applicazione */}
      <App />
    </BrowserRouter>
  </StrictMode>
)

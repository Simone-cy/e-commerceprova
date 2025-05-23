/**
 * main.jsx
 * 
 * Punto di ingresso principale dell'applicazione React e-commerce.
 * Questo file si occupa di:
 * - Inizializzare l'applicazione React
 * - Configurare il router per la navigazione
 * - Montare l'applicazione nel DOM
 * - Applicare modalità StrictMode per rilevare problemi durante lo sviluppo
 * 
 * L'applicazione viene renderizzata nell'elemento con id "root" del file HTML.
 */

// Importazione di StrictMode per rilevare potenziali problemi nell'applicazione
import { StrictMode } from 'react'
// Importazione di createRoot per il rendering con React 18+
import { createRoot } from 'react-dom/client'
// Importazione di BrowserRouter per la gestione delle route
import { BrowserRouter } from 'react-router-dom'
// Importazione degli stili CSS globali
import './index.css'
// Importazione del componente principale dell'applicazione
import App from './App'

// Selezione dell'elemento DOM dove verrà montata l'applicazione React
const container = document.getElementById('root')
// Creazione della radice React per il rendering
const root = createRoot(container)

// Rendering dell'applicazione React nel DOM
root.render(
  // StrictMode per rilevare potenziali problemi durante lo sviluppo
  <StrictMode>
    {/* BrowserRouter per abilitare il routing nell'applicazione */}
    <BrowserRouter>
      {/* Componente principale dell'applicazione */}
      <App />
    </BrowserRouter>
  </StrictMode>
)

/**
 * Configurazione centralizzata per l'URL base dell'API
 * Utilizziamo un percorso relativo che verrà gestito dal proxy Netlify
 * In ambiente di sviluppo, potrebbe essere necessario un URL diverso
 */

// Verifica se siamo in produzione
const isProduction = process.env.NODE_ENV === 'production' || 
                     window.location.hostname.includes('netlify.app') ||
                     !window.location.hostname.includes('localhost');

// Esporta l'URL base dell'API appropriato
export const API_BASE_URL = isProduction
  ? '/api'  // In produzione su Netlify, usa il percorso del proxy
  : 'http://ruggierosmn.altervista.org/API'; // In sviluppo locale, usa l'URL diretto

console.log('API_BASE_URL:', API_BASE_URL, 'isProduction:', isProduction);

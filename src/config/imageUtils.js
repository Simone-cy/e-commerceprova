/**
 * imageUtils.js
 * 
 * Questo file fornisce utility per la gestione delle immagini nell'applicazione e-commerce.
 * Si occupa principalmente di convertire gli URL delle immagini tra diversi formati,
 * gestire i percorsi per il proxy Netlify in produzione, e fornire immagini di fallback
 * quando necessario. Risolve anche problemi di mixed content tra HTTP e HTTPS.
 */

import { API_BASE_URL } from './api';

/**
 * Converte un URL assoluto di un'immagine in un percorso che utilizzerà il proxy in produzione
 * @param {string} imageUrl - URL dell'immagine dal database
 * @returns {string} URL convertito appropriatamente per l'ambiente
 */
export const getProxiedImageUrl = (imageUrl) => {
  // Log per debug
  console.debug('Original image URL:', imageUrl);
  
  if (!imageUrl) {
    return 'https://via.placeholder.com/200?text=No+Image';
  }

  // Se è un data URL, lo restituiamo come è
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Ottieni l'informazione se siamo in produzione dalla stessa logica di api.js
  const isProduction = process.env.NODE_ENV === 'production' || 
                       window.location.hostname.includes('netlify.app') ||
                       !window.location.hostname.includes('localhost');
  
  // CASO 1: URL con percorso completo API
  // Se è un URL che contiene il path esatto api.php?path=image che arriva dal backend
  if (imageUrl.includes('api.php?path=image')) {
    if (isProduction) {
      // Se siamo in produzione e l'URL è assoluto
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // Gestisce sia il caso HTTP che HTTPS
        const url = new URL(imageUrl);
        // Costruisci un nuovo URL relativo che passa attraverso il proxy Netlify
        return `/api/api.php${url.search}`;
      } else if (imageUrl.startsWith('/')) {
        // Se è già un percorso relativo ma non inizia con /api
        if (!imageUrl.startsWith('/api/')) {
          return `/api${imageUrl}`;
        }
        return imageUrl; // Già nel formato /api/...
      }
    } else {
      // In sviluppo, se è un percorso relativo (non un URL completo)
      if (imageUrl.startsWith('/')) {
        return `http://ruggierosmn.altervista.org/API${imageUrl}`;
      }
    }
  }
  
  // CASO 2: URL relativo semplice /api/...
  if (imageUrl.startsWith('/api/')) {
    return imageUrl; // È già nel formato corretto per il proxy
  }
  
  // CASO 3: URL assoluto di Altervista
  if (imageUrl.startsWith('http://ruggierosmn.altervista.org/') || 
      imageUrl.startsWith('https://ruggierosmn.altervista.org/')) {
    if (isProduction) {
      // Estrai il percorso dopo 'API/'
      const regex = /ruggierosmn\.altervista\.org\/API\/(.+)/;
      const match = imageUrl.match(regex);
      if (match && match[1]) {
        return `/api/${match[1]}`;
      } else {
        // Se non riesce a estrarre il percorso, usa un approccio più semplice
        return imageUrl.replace(/https?:\/\/ruggierosmn\.altervista\.org\/API/g, '/api');
      }
    }
  }
  
  // CASO 4: Per tutti gli altri percorsi relativi
  if (imageUrl.startsWith('/')) {
    if (isProduction) {
      // Assicuriamoci che passi attraverso il proxy
      if (!imageUrl.startsWith('/api')) {
        return `/api${imageUrl}`;
      }
      return imageUrl;
    } else {
      // In sviluppo, convertiamo i percorsi relativi in URL completi
      return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
  }

  // Log l'URL finale
  const result = imageUrl;
  console.debug('Converted image URL:', result);
  return result;
};

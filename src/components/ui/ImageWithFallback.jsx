/**
 * ImageWithFallback.jsx
 * 
 * Questo componente gestisce il caricamento delle immagini con meccanismi avanzati:
 * - Mostra uno stato di caricamento durante il download
 * - Gestisce gli errori di caricamento con tentativi multipli
 * - Offre un'immagine di fallback quando il caricamento fallisce definitivamente
 * - Supporta URL proxy e immagini ottimizzate per l'ambiente di produzione
 * - Fornisce feedback visivo all'utente durante ogni fase del caricamento
 */

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getProxiedImageUrl } from '../../config/imageUtils';

/**
 * Componente React per la visualizzazione di immagini con gestione avanzata degli errori e del caricamento
 * 
 * @param {Object} props - Le proprietà del componente
 * @param {string} props.src - L'URL dell'immagine da caricare
 * @param {string} props.alt - Testo alternativo per l'accessibilità
 * @param {string} props.fallbackSrc - URL dell'immagine da mostrare in caso di errore
 * @param {number} props.retryCount - Numero di tentativi di ricaricamento in caso di errore
 * @param {number|string} props.width - Larghezza dell'immagine
 * @param {number|string} props.height - Altezza dell'immagine
 * @param {Object} props.sx - Stili aggiuntivi per il componente Box che contiene l'immagine
 */
const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = 'https://via.placeholder.com/200?text=No+Image', 
  retryCount = 2,
  width,
  height,
  sx = {}, 
  ...props 
}) => {
  // Stati per la gestione del caricamento dell'immagine
  const [imageSrc, setImageSrc] = useState(''); // URL corrente dell'immagine
  const [isLoading, setIsLoading] = useState(true); // Stato di caricamento
  const [error, setError] = useState(false); // Stato di errore
  const [retries, setRetries] = useState(0); // Contatore dei tentativi di caricamento
  /**
   * Effect che gestisce il caricamento iniziale dell'immagine
   * Si attiva quando cambia l'URL sorgente dell'immagine o il fallback
   */
  useEffect(() => {
    // Se non viene fornito un URL sorgente, usa subito l'immagine di fallback
    if (!src) {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // Resetta lo stato per il nuovo caricamento
    setIsLoading(true);
    setError(false);
    
    // Converti l'URL attraverso la funzione di proxy
    const proxiedUrl = getProxiedImageUrl(src);
    setImageSrc(proxiedUrl);
    
    // Log di debug solo in ambiente di sviluppo
    if (process.env.NODE_ENV !== 'production') {
      console.log('Caricamento immagine:', proxiedUrl);
    }
  }, [src, fallbackSrc]);
  /**
   * Gestisce gli errori di caricamento dell'immagine
   * Implementa un sistema di retry con backoff esponenziale e fallback finale
   */
  const handleError = () => {
    if (retries < retryCount) {
      // Ritenta con un breve ritardo per dare tempo ai server/rete di riprendersi
      // Il ritardo aumenta con il numero di tentativi per evitare di sovraccaricare la rete
      setTimeout(() => {
        setRetries(prev => prev + 1);
        // Forza un ricaricamento aggiungendo un timestamp
        const timestamp = new Date().getTime();
        setImageSrc(`${getProxiedImageUrl(src)}${src.includes('?') ? '&' : '?'}t=${timestamp}`);
      }, 1000 * (retries + 1)); // Ritardo crescente per ogni tentativo
    } else {
      // Dopo tutti i tentativi, mostra l'immagine di fallback
      setError(true);
      setIsLoading(false);
      setImageSrc(fallbackSrc);
    }
  };

  // Gestore del caricamento completato
  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  return (
    <Box 
      sx={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        ...sx
      }}
    >
      {isLoading && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={30} />
        </Box>
      )}

      <img
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
        {...props}
      />
      
      {error && retries >= retryCount && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
            Impossibile caricare l'immagine
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageWithFallback;

/**
 * ImageDebugPage.jsx
 * 
 * Questa pagina fornisce strumenti per il debug delle immagini nell'applicazione.
 * Include funzionalità per:
 * - Visualizzare le informazioni sull'ambiente di esecuzione
 * - Testare il caricamento delle immagini
 * - Verificare la configurazione del proxy Netlify
 * - Diagnosticare problemi di caricamento
 */

// Importazione delle dipendenze React e dei componenti Material-UI
import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Divider, Alert } from '@mui/material';
import ApiTester from '../debug/ApiTester';
import ImageUrlTester from '../debug/ImageUrlTester';
import ImageDebugger from '../debug/ImageDebugger';

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';

/**
 * Componente principale della pagina di debug delle immagini
 * Fornisce un'interfaccia per testare e diagnosticare problemi con le immagini
 */
const ImageDebugPage = () => {
  // Stato per memorizzare le informazioni sull'ambiente
  const [environment, setEnvironment] = useState({
    netlify: false,      // Indica se l'app è in esecuzione su Netlify
    production: false,   // Indica se l'app è in modalità produzione
    hostname: '',        // Nome dell'host corrente
    apiBaseUrl: ''      // URL base per le chiamate API
  });
  /**
   * Effect che rileva l'ambiente di esecuzione dell'applicazione
   * Si attiva una sola volta all'avvio del componente
   */
  useEffect(() => {
    // Determina se l'applicazione è in esecuzione su Netlify
    const isNetlify = window.location.hostname.includes('netlify.app');
    // Verifica se siamo in ambiente di produzione (su Netlify o con NODE_ENV=production)
    const isProduction = process.env.NODE_ENV === 'production' || isNetlify;
    
    // Aggiorna lo stato con le informazioni sull'ambiente
    setEnvironment({
      netlify: isNetlify,
      production: isProduction,
      hostname: window.location.hostname,
      apiBaseUrl: API_BASE_URL
    });
  }, []);
  /**
   * Render del componente
   * Struttura la pagina in sezioni per facilitare il debugging
   */
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Intestazione della pagina */}
      <Typography variant="h4" gutterBottom align="center">
        Debug Immagini
      </Typography>
      
      {/* Descrizione dello scopo della pagina */}
      <Typography variant="body1" paragraph align="center">
        Questa pagina ti aiuta a diagnosticare problemi con il caricamento delle immagini
      </Typography>
      
      {/* Sezione informazioni sull'ambiente di esecuzione */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Informazioni sull'ambiente
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>
              Ambiente:
            </Typography>
            <Typography variant="body2">
              {environment.production ? 'Produzione' : 'Sviluppo'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>
              Hostname:
            </Typography>
            <Typography variant="body2">
              {environment.hostname}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>
              Netlify:
            </Typography>
            <Typography variant="body2">
              {environment.netlify ? 'Sì' : 'No'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', width: 150 }}>
              API Base URL:
            </Typography>
            <Typography variant="body2">
              {environment.apiBaseUrl}
            </Typography>
          </Box>
        </Box>
          {/* Avviso informativo per l'ambiente di produzione */}
        {environment.production && (
          <Alert severity="info" sx={{ mt: 2 }}>
            In produzione, le richieste alle immagini vengono instradate attraverso il proxy Netlify usando {API_BASE_URL}
          </Alert>
        )}
      </Paper>
      
      {/* Separatore tra le sezioni */}
      <Divider sx={{ my: 4 }} />
      
      {/* Componente per il debug generale delle immagini */}
      <ImageDebugger />
      
      {/* Separatore tra le sezioni */}
      <Divider sx={{ my: 4 }} />
      
      {/* Componente per testare URL specifici delle immagini */}
      <ImageUrlTester />
      
      {/* Separatore tra le sezioni */}
      <Divider sx={{ my: 4 }} />
      
      {/* Componente per testare le chiamate API */}
      <ApiTester />
    </Container>
  );
};

export default ImageDebugPage;

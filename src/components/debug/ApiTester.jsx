/**
 * Componente utility per testare le richieste API e verificare il corretto funzionamento del proxy.
 * Permette di:
 * - Testare endpoint API personalizzati
 * - Visualizzare le risposte complete delle richieste
 * - Verificare gli header e lo stato delle risposte
 * - Debuggare problemi di connessione con il backend
 */

// Importazione delle dipendenze React
import React, { useState } from 'react';
// Importazione dei componenti Material-UI
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';

/**
 * Componente principale per il test delle API
 */
const ApiTester = () => {
  // URL da testare
  const [testUrl, setTestUrl] = useState('');
  // Stato di caricamento durante la richiesta
  const [isLoading, setIsLoading] = useState(false);
  // Risultato della richiesta API
  const [result, setResult] = useState(null);
  // Eventuali errori durante la richiesta
  const [error, setError] = useState(null);
  /**
   * Gestisce l'esecuzione del test API
   * Effettua una richiesta all'URL specificato e gestisce la risposta
   */
  const handleTest = async () => {
    // Inizializzazione degli stati per il nuovo test
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Preparazione dell'URL per il test
      // Se l'URL inizia con '/' o 'http', lo usa direttamente
      // Altrimenti lo concatena con l'URL base delle API
      const url = testUrl.startsWith('/') || testUrl.startsWith('http') 
        ? testUrl 
        : `${API_BASE_URL}/${testUrl}`;
      
      console.log(`Test dell'URL API: ${url}`);
        // Esecuzione della richiesta HTTP
      const response = await fetch(url);
      
      // Gestione della risposta in base al tipo di contenuto
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Se la risposta è JSON, la parsifichiamo
        data = await response.json();
      } else {
        // Se la risposta è testo, la tronchiamo se troppo lunga
        data = await response.text();
        if (data.length > 1000) {
          data = data.substring(0, 1000) + '... [testo troncato]';
        }
      }      // Memorizzazione del risultato con tutti i dettagli della risposta
      setResult({
        status: response.status,            // Codice di stato HTTP
        statusText: response.statusText,    // Testo dello stato HTTP
        headers: Object.fromEntries(response.headers.entries()), // Headers della risposta
        data                               // Dati della risposta
      });
    } catch (err) {
      // Gestione degli errori durante la richiesta
      setError(err.message);
    } finally {
      // Ripristino dello stato di caricamento
      setIsLoading(false);
    }
  };

  /**
   * Rendering del componente
   */
  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" gutterBottom>Test delle API</Typography>
      
      {/* Form per l'inserimento dell'URL da testare */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="URL API"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="api.php?path=products"
          fullWidth
          variant="outlined"
          sx={{ mr: 2 }}
          size="small"
        />
        <Button 
          variant="contained" 
          onClick={handleTest}
          disabled={isLoading || !testUrl}
        >
          Testa
        </Button>
      </Box>
      
      {/* Indicatore di caricamento */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* Visualizzazione degli errori */}
      {error && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee' }}>
          <Typography variant="subtitle1" color="error">Errore</Typography>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
      
      {/* Visualizzazione dei risultati della richiesta */}
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Risposta</Typography>
          
          {/* Stato della risposta HTTP */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Stato:</strong> {result.status} {result.statusText}
            </Typography>
          </Box>
          
          {/* Headers della risposta */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Intestazioni:</strong>
            </Typography>
            <Box component="pre" sx={{ 
              mt: 0.5, 
              p: 1, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '100px',
              fontSize: '0.75rem'
            }}>
              {JSON.stringify(result.headers, null, 2)}
            </Box>
          </Box>
          
          {/* Dati della risposta */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Dati:</strong>
            </Typography>
            <Box component="pre" sx={{ 
              mt: 0.5, 
              p: 1, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '300px',
              fontSize: '0.75rem'
            }}>
              {typeof result.data === 'object' 
                ? JSON.stringify(result.data, null, 2) 
                : result.data}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ApiTester;

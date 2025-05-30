/**
 * Componente per il test diretto degli URL delle immagini
 * Fornisce un'interfaccia per verificare il caricamento delle immagini in diverse modalità:
 * - Test diretto dell'URL
 * - Test attraverso il proxy
 * - Test utilizzando il componente ImageWithFallback
 * 
 * Utile per debugging quando le immagini non vengono caricate correttamente
 */

// Importazione delle dipendenze React
import React, { useState, useEffect } from 'react';
// Importazione dei componenti Material-UI
import { Box, Button, TextField, Typography, Paper, Grid, Select, MenuItem, 
         FormControl, InputLabel, Tooltip, IconButton, Alert } from '@mui/material';
// Importazione delle icone
import { ContentCopy as CopyIcon, Refresh as RefreshIcon, Clear as ClearIcon } from '@mui/icons-material';
// Importazione delle utility per la gestione delle immagini
import { getProxiedImageUrl } from '../../config/imageUtils';
import ImageWithFallback from '../ui/ImageWithFallback';

const ImageUrlTester = () => {
  // Stato per l'URL dell'immagine da testare
  const [imageUrl, setImageUrl] = useState('');
  // Stato per memorizzare i risultati dei test
  const [testResults, setTestResults] = useState([]);
  // Modalità di test: diretta, con proxy o tramite componente
  const [testMode, setTestMode] = useState('direct');
  // Stati per la gestione del processo di fetch
  const [isTestingFetch, setIsTestingFetch] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);
  // Stato per la gestione degli errori
  const [error, setError] = useState(null);
  /**
   * Effect per caricare i risultati dei test precedenti da localStorage
   * Viene eseguito solo al mount del componente
   */
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('imageTestResults');
      if (savedResults) {
        setTestResults(JSON.parse(savedResults).slice(0, 5));
      }
    } catch (err) {
      console.error('Errore nel caricamento dei risultati salvati:', err);
    }
  }, []);

  /**
   * Effect per salvare i risultati dei test in localStorage
   * Si attiva ogni volta che cambia l'array testResults
   */
  useEffect(() => {
    try {
      localStorage.setItem('imageTestResults', JSON.stringify(testResults));
    } catch (err) {
      console.error('Errore nel salvataggio dei risultati:', err);
    }
  }, [testResults]);
  /**
   * Gestisce l'esecuzione del test sull'URL dell'immagine
   * Verifica il caricamento dell'immagine in base alla modalità selezionata
   */
  const handleTest = async () => {
    if (!imageUrl.trim()) {
      return;
    }

    // Genera l'URL con proxy per il test
    const proxiedUrl = getProxiedImageUrl(imageUrl);
    
    // Resetta gli stati per il nuovo test
    setIsTestingFetch(true);
    setFetchResult(null);
    setError(null);
      // Esegui il test fetch solo se non è un URL data: (base64)
    let fetchStatus = null;
    if (!proxiedUrl.startsWith('data:')) {
      try {
        // Seleziona l'URL da testare in base alla modalità
        const urlToTest = testMode === 'direct' ? imageUrl : proxiedUrl;
        // Esegue la richiesta fetch in modalità no-cors per evitare problemi CORS
        const response = await fetch(urlToTest, { mode: 'no-cors' });
        fetchStatus = {
          success: true,
          status: 'Successo (modalità no-cors)',
          time: new Date().toISOString()
        };
      } catch (err) {
        // Gestione degli errori durante il fetch
        fetchStatus = {
          success: false,
          error: err.message,
          time: new Date().toISOString()
        };
        setError(`Errore durante il fetch: ${err.message}`);
      }
    }
    
    setIsTestingFetch(false);
    setFetchResult(fetchStatus);
    
    // Aggiungi il risultato all'inizio dell'array
    setTestResults(prev => [{
      original: imageUrl,
      proxied: proxiedUrl,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now(),
      fetchStatus
    }, ...prev.slice(0, 4)]); // Mantieni solo gli ultimi 4 test
  };
  /**
   * Copia l'URL fornito negli appunti del sistema
   * @param {string} url - L'URL da copiare
   */
  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  /**
   * Resetta tutti i risultati dei test
   * Rimuove sia dallo stato che da localStorage
   */
  const handleClear = () => {
    setTestResults([]);
    localStorage.removeItem('imageTestResults');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Test URL Immagini</Typography>
        <Tooltip title="Cancella tutti i test">
          <IconButton onClick={handleClear} size="small">
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, gap: 2 }}>
        <TextField
          label="URL Immagine"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Inserisci un URL immagine da testare"
          fullWidth
          variant="outlined"
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Modalità Test</InputLabel>
          <Select
            value={testMode}
            onChange={(e) => setTestMode(e.target.value)}
            label="Modalità Test"
          >
            <MenuItem value="direct">URL Diretto</MenuItem>
            <MenuItem value="proxied">URL Proxied</MenuItem>
            <MenuItem value="component">Componente</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          onClick={handleTest}
          disabled={!imageUrl.trim() || isTestingFetch}
        >
          {isTestingFetch ? 'Testing...' : 'Test'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {testResults.map(result => (
        <Paper 
          key={result.id} 
          variant="outlined" 
          sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Test eseguito alle {result.timestamp}
            </Typography>
            <Tooltip title="Esegui di nuovo il test">
              <IconButton 
                size="small"
                onClick={() => {
                  setImageUrl(result.original);
                  setTimeout(() => handleTest(), 100);
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2">URL Originale:</Typography>
                  <Tooltip title="Copia URL">
                    <IconButton size="small" onClick={() => handleCopyUrl(result.original)}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  {result.original}
                </Typography>
                
                <Box sx={{ mt: 1, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ddd' }}>
                  <img 
                    src={result.original} 
                    alt="Original URL Test" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '150px',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML += '<p style="color: red; margin-top: 8px; text-align: center;">⚠️ Errore caricamento</p>';
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2">URL con Proxy:</Typography>
                  <Tooltip title="Copia URL">
                    <IconButton size="small" onClick={() => handleCopyUrl(result.proxied)}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  {result.proxied}
                </Typography>
                
                <Box sx={{ mt: 1, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ddd' }}>
                  {testMode === 'component' ? (
                    <ImageWithFallback
                      src={result.original}
                      alt="Component Test"
                      height={150}
                      retryCount={2}
                    />
                  ) : (
                    <img 
                      src={result.proxied} 
                      alt="Proxied URL Test" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '150px',
                      }}
                      onError={(e) => {
                        console.error("Image loading error:", e.target.src);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML += '<p style="color: red; margin-top: 8px; text-align: center;">⚠️ Errore caricamento</p>';
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {result.fetchStatus && (
            <Box sx={{ mt: 1, p: 1, backgroundColor: result.fetchStatus.success ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                <strong>Fetch test:</strong> {result.fetchStatus.success ? 'Successful' : 'Failed'} 
                {result.fetchStatus.status && ` (${result.fetchStatus.status})`}
                {result.fetchStatus.error && ` - ${result.fetchStatus.error}`}
              </Typography>
            </Box>
          )}
        </Paper>
      ))}
      
      {testResults.length === 0 && (
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
          Nessun test eseguito. Inserisci un URL immagine per testarlo.
        </Typography>
      )}
    </Paper>
  );
};

export default ImageUrlTester;

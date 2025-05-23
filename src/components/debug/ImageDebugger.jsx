/**
 * ImageDebugger.jsx
 * 
 * Strumento di debug per verificare il caricamento e la visualizzazione delle immagini 
 * nell'applicazione. Questo componente è utile durante lo sviluppo per testare:
 * - La corretta configurazione degli URL delle immagini
 * - Il funzionamento del proxy per le immagini
 * - La gestione degli errori di caricamento
 * 
 * Nota: Questo componente è pensato solo per l'ambiente di sviluppo
 * e non dovrebbe essere accessibile in produzione.
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { API_BASE_URL } from '../../config/api';
import { getProxiedImageUrl } from '../../config/imageUtils';

/**
 * Componente ImageDebugger
 * 
 * Visualizza informazioni di debug sulle immagini dei prodotti per aiutare
 * a diagnosticare problemi di caricamento o visualizzazione.
 * 
 * @returns {JSX.Element} Componente di debug per le immagini
 */
const ImageDebugger = () => {
  // Stato per memorizzare i prodotti da testare
  const [products, setProducts] = useState([]);
  // Stato per gli eventuali errori durante il caricamento
  const [error, setError] = useState(null);

  /**
   * Effect per recuperare alcuni prodotti da utilizzare come test
   */
  useEffect(() => {
    /**
     * Funzione asincrona per recuperare i prodotti dall'API
     */
    const fetchProducts = async () => {
      try {
        // Richiesta all'API per ottenere la lista dei prodotti
        const response = await fetch(`${API_BASE_URL}/api.php?path=products`);
        if (!response.ok) {
          throw new Error(`Errore nel caricamento dei prodotti: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data.slice(0, 3)); // Limita a 3 prodotti per semplicità
      } catch (err) {
        // Gestione degli errori durante la richiesta
        setError(err.message);
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Typography variant="h6" color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" gutterBottom>Debug Informazioni Immagini</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          NODE_ENV: {process.env.NODE_ENV || 'not defined'}
        </Typography>
        <Typography variant="body2">
          API_BASE_URL: {API_BASE_URL}
        </Typography>
      </Box>

      {products.length > 0 && (
        <List>
          {products.map((product) => (
            <ListItem key={product.id} divider>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1">{product.name}</Typography>
                
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  <strong>URL originale:</strong> {product.image || 'null'}
                </Typography>
                
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  <strong>URL proxied:</strong> {getProxiedImageUrl(product.image) || 'null'}
                </Typography>
                
                <Box sx={{ mt: 2, p: 2, border: '1px solid #eee' }}>
                  <Typography variant="body2">Anteprima immagine:</Typography>
                  <img 
                    src={getProxiedImageUrl(product.image)} 
                    alt={product.name} 
                    style={{ maxWidth: '100%', maxHeight: '150px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200?text=Errore+Caricamento';
                    }}
                  />
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ImageDebugger;

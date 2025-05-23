/**
 * ProductDetail.jsx
 * 
 * Questo file implementa la pagina di dettaglio del prodotto per l'applicazione e-commerce.
 * Mostra informazioni dettagliate su un prodotto specifico, inclusi nome, prezzo,
 * descrizione, immagine, valutazioni e recensioni. Fornisce anche funzionalità
 * per aggiungere il prodotto al carrello o alla lista dei desideri.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useContext, useEffect, useCallback, useMemo, memo } from 'react';
// Importazione dei componenti di navigazione
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
// Importazione dei componenti Material-UI
import {
  Container, Typography, Box, Button, Grid, CircularProgress, Paper,
  Rating, Divider, TextField, Avatar, Card, CardMedia, CardContent, Alert, Snackbar,
  Chip, IconButton, Skeleton
} from '@mui/material';
// Importazione delle icone Material-UI
import { 
  ShoppingCart as ShoppingCartIcon, 
  ArrowBack, 
  Star as StarIcon, 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Remove as RemoveIcon,
  Add as AddIcon
} from '@mui/icons-material';
// Importazione dei contesti per autenticazione, carrello e lista desideri
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext';
// Importazione del componente per le recensioni
import ReviewSection from '../reviews/ReviewSection';
// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// Importazione dell'utility per le immagini
import { getProxiedImageUrl } from '../../config/imageUtils';
// Importazione del componente immagine con fallback
import ImageWithFallback from '../ui/ImageWithFallback';

/**
 * Componenti memorizzati (memo) per migliorare le prestazioni
 * Il componente memo evita ri-renderizzazioni non necessarie quando le props non cambiano
 */

/**
 * Componente che mostra lo stato di caricamento per i dettagli del prodotto
 * Utilizza skeleton (scheletri) di Material-UI per mostrare un'anteprima della struttura della pagina
 * mentre i dati vengono caricati
 */
const ProductLoading = memo(() => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Grid container spacing={4}>
      {/* Placeholder per l'immagine del prodotto */}
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={400} />
      </Grid>
      {/* Placeholder per le informazioni del prodotto */}
      <Grid item xs={12} md={6}>
        {/* Placeholder per il titolo */}
        <Skeleton variant="text" height={60} width="80%" />
        {/* Placeholder per prezzo e valutazioni */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Skeleton variant="text" width={120} height={30} />
          <Skeleton variant="text" width={100} height={30} sx={{ ml: 2 }} />
        </Box>
        {/* Placeholder per altre info */}
        <Skeleton variant="text" height={30} width="60%" sx={{ mt: 2 }} />
        {/* Placeholder per la descrizione */}
        <Skeleton variant="rectangular" height={100} sx={{ mt: 3 }} />
        {/* Placeholder per i pulsanti */}
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={50} width={150} />
        </Box>
      </Grid>
    </Grid>
  </Container>
));

/**
 * Componente per visualizzare gli errori durante il caricamento del prodotto
 * Mostra un messaggio di errore e fornisce opzioni per riprovare o tornare alla lista prodotti
 * 
 * @param {Object} props - Proprietà del componente
 * @param {string} props.message - Il messaggio di errore da mostrare
 * @param {Function} props.onRetry - Funzione da chiamare quando l'utente clicca su "Riprova"
 */
const ProductError = memo(({ message, onRetry }) => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>
        {message || 'Si è verificato un errore durante il caricamento del prodotto'}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={onRetry}
        sx={{ mt: 2, mr: 2 }}
      >
        Riprova
      </Button>
      <Button
        variant="outlined"
        component={RouterLink}
        to="/products"
        sx={{ mt: 2 }}
      >
        Torna ai Prodotti
      </Button>
    </Paper>
  </Container>
));

// Componente rimosso perché ora implementato in ReviewSection.jsx

/**
 * Componente per la visualizzazione del prezzo del prodotto
 * Gestisce la visualizzazione differenziata per i prodotti in sconto, mostrando
 * sia il prezzo scontato che quello originale insieme alla percentuale di sconto
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Object} props.product - Il prodotto di cui mostrare il prezzo
 * @param {number} props.product.price - Il prezzo scontato (se in sconto) o prezzo normale
 * @param {number} props.product.originalPrice - Il prezzo originale prima dello sconto
 * @param {number} props.product.discount - Percentuale di sconto applicata
 */
const ProductPrice = memo(({ product }) => {
  // Calcola la percentuale di sconto, se presente
  const discountPercentage = useMemo(() => product.discount || 0, [product.discount]);
  
  return (
    <>
      {discountPercentage > 0 ? (
        // Visualizzazione per i prodotti in sconto
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h4"
            component="span"
            color="error"
            sx={{ mr: 2 }}
          >
            €{product.price}
          </Typography>
          <Typography
            variant="h6"
            component="span"
            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
          >
            €{product.originalPrice}
          </Typography>
          <Chip
            label={`${discountPercentage}% SCONTO`}
            color="error"
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
      ) : (
        // Visualizzazione per i prodotti a prezzo pieno
        <Typography variant="h4" color="primary" gutterBottom>
          €{product.price}
        </Typography>
      )}
    </>
  );
});

// Componente rimosso perché ora implementato in ReviewSection.jsx

// Componente rimosso perché ora implementato in ReviewSection.jsx

/**
 * Componente principale per la visualizzazione dei dettagli del prodotto
 * Gestisce il caricamento dei dati, la visualizzazione delle informazioni
 * e le interazioni dell'utente come l'aggiunta al carrello o alla lista desideri
 * 
 * Questo componente è responsabile di:
 * - Recuperare i dettagli del prodotto dal server usando l'ID dalla URL
 * - Gestire lo stato di caricamento e gli errori
 * - Permettere all'utente di selezionare la quantità
 * - Consentire l'aggiunta al carrello e alla lista desideri
 * - Visualizzare le recensioni attraverso il componente ReviewSection
 */
function ProductDetail() {
  // Estrazione dell'ID prodotto dai parametri dell'URL
  const { productId } = useParams();
  // Hook per la navigazione programmata
  const navigate = useNavigate();
  // Accesso ai contesti dell'applicazione
  const { isAuthenticated, user, token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  
  // Stati relativi al prodotto
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // Stato per le notifiche
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  /**
   * Recupera i dettagli del prodotto dal server
   * Utilizza useCallback per la memorizzazione
   * 
   * @param {string} idFromParams - ID del prodotto da recuperare
   */
  const fetchProductDetails = useCallback(async (idFromParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api.php?path=products`);
      if (!response.ok) {
        throw new Error(`Errore nel recupero dei prodotti: ${response.statusText}`);
      }
      
      const products = await response.json();
      if (!Array.isArray(products)) {
        throw new Error("Formato dati non valido dall'API.");
      }
      
      const parsedProductId = parseInt(idFromParams, 10);
      
      if (isNaN(parsedProductId)) {
        throw new Error('ID prodotto non valido');
      }
        const foundProduct = products.find(p => Number(p.id) === parsedProductId);
      
      if (!foundProduct) {
        throw new Error('Prodotto non trovato');
      }
      
      // Assicura che il prodotto abbia un oggetto rating
      if (!foundProduct.rating) {
        foundProduct.rating = { average: 0, count: 0 };
      }
      
      setProduct(foundProduct);
    } catch (error) {
      console.error("Errore in fetchProductDetails:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Metodo fetchReviews rimosso, ora gestito da ReviewSection
    /**
   * Effect per caricare i dettagli del prodotto al montaggio del componente
   * Si attiva quando l'ID del prodotto cambia nell'URL o quando la funzione fetchProductDetails viene ricostruita
   */
  useEffect(() => {
    // Verifica che l'ID prodotto sia valido prima di procedere
    if (productId && typeof productId === 'string' && productId.trim() !== '') {
      // Chiama la funzione per recuperare i dettagli del prodotto
      fetchProductDetails(productId);
    } else {
      // Gestisce il caso in cui l'ID prodotto non sia valido
      setLoading(false);
      setError('ID prodotto mancante o non valido');
      setNotification({ open: true, message: 'ID prodotto mancante o non valido.', severity: 'error' });
    }
  }, [productId, fetchProductDetails]);
    /**
   * Gestori eventi memorizzati con useCallback per migliorare le prestazioni
   * useCallback evita che queste funzioni vengano ricreate ad ogni render,
   * riducendo il numero di ri-renderizzazioni nei componenti figli
   */
   
  /**
   * Aggiorna la quantità selezionata con un valore specifico
   * 
   * @param {number} newValue - Il nuovo valore della quantità
   */
  const handleQuantityChange = useCallback((newValue) => {
    setQuantity(newValue);
  }, []);
  
  /**
   * Incrementa la quantità selezionata di 1
   */
  const handleQuantityIncrease = useCallback(() => {
    setQuantity(prevQuantity => prevQuantity + 1);
  }, []);
  
  /**
   * Decrementa la quantità selezionata di 1, ma non va sotto 1
   */
  const handleQuantityDecrease = useCallback(() => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
  }, []);
    /**
   * Aggiunge il prodotto corrente al carrello
   * Imposta una notifica di conferma per l'utente e resetta la quantità selezionata
   * 
   * Utilizza il contesto del carrello per aggiungere il prodotto con la quantità selezionata.
   * Dopo l'aggiunta, mostra una notifica di conferma e resetta il selettore di quantità a 1.
   */
  const handleAddToCart = useCallback(() => {
    if (product) {
      // Aggiungi il prodotto al carrello con le informazioni necessarie
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
      
      // Mostra una notifica di conferma all'utente
      setNotification({
        open: true,
        message: `${product.name} aggiunto al carrello`,
        severity: 'success'
      });
      setQuantity(1); // Resetta la quantità dopo l'aggiunta
    }
  }, [product, quantity, addToCart]);
    /**
   * Gestisce l'aggiunta o la rimozione del prodotto dalla lista desideri
   * Verifica l'autenticazione dell'utente e la disponibilità dei dati
   */
  const handleWishlist = useCallback(() => {
    if (!isAuthenticated()) {
      setNotification({
        open: true,
        message: 'Per favore accedi per aggiungere articoli alla tua lista desideri',
        severity: 'warning'
      });
      return;
    }
    
    if (!product || product.id === undefined) {
      setNotification({ 
        open: true, 
        message: 'I dati del prodotto non sono disponibili.', 
        severity: 'error' 
      });
      return;
    }    // Verifica se il prodotto è già nella lista desideri
    const isInWishlistNow = isInWishlist(product.id);
    
    try {
      if (isInWishlistNow) {
        // Rimuove il prodotto dalla lista desideri
        removeFromWishlist(product.id);
        setNotification({
          open: true,
          message: `${product.name} rimosso dalla lista desideri`,
          severity: 'info'
        });
      } else {
        // Aggiunge il prodotto alla lista desideri
        addToWishlist(product);
        setNotification({
          open: true,
          message: `${product.name} aggiunto alla lista desideri`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Operazione lista desideri fallita:", error);
      setNotification({
        open: true,
        message: error.message || 'Operazione lista desideri fallita. Per favore riprova.',
        severity: 'error'
      });
    }
  }, [product, isAuthenticated, isInWishlist, addToWishlist, removeFromWishlist]);  // Metodi relativi alle recensioni rimossi, ora gestiti da ReviewSection
  
  /**
   * Gestisce il tentativo di ricaricare i dati del prodotto
   */
  const handleRetry = useCallback(() => {
    fetchProductDetails(productId);
  }, [productId, fetchProductDetails]);

  /**
   * Chiude la notifica
   */
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);
  
  /**
   * Gestisce gli errori di caricamento delle immagini
   * Imposta un'immagine placeholder in caso di errore
   */
  const handleImageError = useCallback((e) => {
    e.target.src = 'https://via.placeholder.com/400?text=Immagine+Non+Disponibile';
  }, []);

  // Quando si verifica un errore durante il caricamento del prodotto
  if (error) {
    return <ProductError message={error} onRetry={handleRetry} />;
  }

  // Durante il caricamento
  if (loading) {
    return <ProductLoading />;
  }

  // Quando il prodotto non viene trovato
  if (!product) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="info">Prodotto non trovato</Alert>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 4 }}
      >
        Indietro
      </Button>      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              height={400}
              retryCount={3}
              sx={{ width: '100%', height: 400 }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <ProductPrice product={product} />

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>            
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1">Quantità:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1}
                  aria-label="Riduci quantità"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ px: 2 }}>{quantity}</Typography>
                <IconButton 
                  size="small" 
                  onClick={handleQuantityIncrease}
                  aria-label="Aumenta quantità"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                size="large"
              >
                Aggiungi al Carrello
              </Button>
              <IconButton
                onClick={handleWishlist}
                color="primary"
                aria-label={isInWishlist(product.id) ? "Rimuovi dalla lista desideri" : "Aggiungi alla lista desideri"}
                sx={{ border: 1, borderColor: 'primary.main' }}
              >
                {isInWishlist(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>      {/* Reviews section */}
      <ReviewSection productId={productId} />
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default memo(ProductDetail);
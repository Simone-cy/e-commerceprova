/**
 * Products.jsx
 * 
 * Questo file implementa la pagina di catalogo prodotti dell'applicazione e-commerce.
 * Fornisce funzionalità di ricerca, filtro, ordinamento e visualizzazione dei prodotti
 * con opzioni per aggiungere articoli al carrello o alla lista desideri.
 * Include anche gestione dello stato di caricamento e degli errori.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useEffect, useContext, useCallback, useMemo, memo } from 'react';
// Importazione dei componenti di navigazione per il routing
import { useNavigate } from 'react-router-dom';
// Importazione dei contesti per accedere a carrello, wishlist e dati utente
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext';
import { AuthContext } from '../../contexts/AuthContext';
// Importazione dei debugger
import ImageDebugger from '../debug/ImageDebugger';
import ApiTester from '../debug/ApiTester';
import ImageUrlTester from '../debug/ImageUrlTester';
// Importazione del componente immagine con fallback
import ImageWithFallback from '../ui/ImageWithFallback';
// Importazione dei componenti Material-UI
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton,
  Rating
} from '@mui/material';
// Importazione delle icone Material-UI
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';

/**
 * Costante per l'immagine di fallback quando l'immagine del prodotto non è disponibile
 * Utilizza un SVG inline per garantire che ci sia sempre un'immagine da mostrare
 */
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999">No Image</text></svg>';
// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// Importazione dell'utility per gestire gli URL delle immagini
import { getProxiedImageUrl } from '../../config/imageUtils';

/**
 * Componenti memorizzati (memo) per migliorare le prestazioni
 * Il componente memo evita ri-renderizzazioni non necessarie quando le props non cambiano
 */

/**
 * Componente che mostra lo stato di caricamento per la pagina dei prodotti
 * Utilizza skeleton (scheletri) di Material-UI per mostrare un'anteprima della struttura della pagina
 * mentre i dati vengono caricati dal server
 */
const ProductsLoading = memo(() => (
  <Container sx={{ py: 8 }}>
    {/* Skeleton per la barra di ricerca e filtri */}
    <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={56} width="100%" />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={56} width="100%" />
      </Grid>
    </Grid>{/* Griglia di prodotti con placeholder di caricamento */}
    <Grid container spacing={4}>
      {Array.from(new Array(6)).map((_, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            {/* Placeholder per l'immagine del prodotto */}
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              {/* Placeholder per il nome del prodotto */}
              <Skeleton variant="text" height={30} width="80%" />
              {/* Placeholder per prezzo e sconto */}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="text" width={40} height={24} sx={{ ml: 1 }} />
              </Box>
              {/* Placeholder per le valutazioni */}
              <Skeleton variant="text" height={24} width="40%" sx={{ mt: 1 }} />
              {/* Placeholder per la descrizione */}
              <Skeleton variant="text" height={20} width="100%" sx={{ mt: 1 }} />
              <Skeleton variant="text" height={20} width="80%" />
            </CardContent>
            {/* Placeholder per i pulsanti */}
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Skeleton variant="rectangular" height={36} width={120} />
              <Skeleton variant="circular" height={36} width={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
));

/**
 * Componente per visualizzare gli errori durante il caricamento dei prodotti
 * Mostra un messaggio di errore con un pulsante per riprovare il caricamento
 * 
 * @param {Object} props - Proprietà del componente
 * @param {string} props.error - Il messaggio di errore da mostrare
 * @param {Function} props.onRetry - Funzione da chiamare quando l'utente clicca su "Riprova"
 */
const ProductsError = memo(({ error, onRetry }) => (
  <Container sx={{ py: 8, textAlign: 'center' }}>
    <Alert 
      severity="error" 
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Riprova
        </Button>
      }
      sx={{ mb: 3 }}
    >
      {error}
    </Alert>
  </Container>
));

/**
 * Componente visualizzato quando nessun prodotto corrisponde ai criteri di ricerca
 * Mostra un messaggio informativo all'utente suggerendo di cambiare i filtri
 */
const NoProductsFound = memo(() => (
  <Box sx={{ textAlign: 'center', mt: 4, p: 4 }}>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      Nessun prodotto trovato
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Prova a modificare i criteri di ricerca
    </Typography>
  </Box>
));

/**
 * Componente scheda prodotto per la visualizzazione di un singolo prodotto nella griglia
 * Gestisce la visualizzazione delle informazioni del prodotto, inclusi immagine, nome, prezzo, valutazioni
 * e pulsanti per aggiungere al carrello o alla wishlist
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Object} props.product - I dati del prodotto da visualizzare
 * @param {Function} props.onAddToCart - Funzione per aggiungere il prodotto al carrello
 * @param {Function} props.onToggleWishlist - Funzione per aggiungere/rimuovere il prodotto dalla wishlist
 * @param {Function} props.isInWishlist - Funzione che verifica se il prodotto è nella wishlist
 * @param {Function} props.onProductClick - Funzione chiamata quando l'utente clicca sulla scheda
 */
const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist, 
  onProductClick 
}) => {
  /**
   * Gestore degli errori di caricamento delle immagini
   * Implementa un sistema di fallback con più alternative quando un'immagine non si carica
   */
  const handleImageError = useCallback((e) => {
    console.error("Errore caricamento immagine:", e.target.src);
    if (e.target.src !== FALLBACK_IMAGE) {
      console.log("Provo con immagine alternativa");
      e.target.src = 'https://placehold.co/200x200/CCCCCC/666666?text=No+Image';
      e.target.onerror = () => {
        console.log("Seconda immagine alternativa");
        e.target.src = FALLBACK_IMAGE;
        e.target.onerror = null;
      };
    }
  }, []);
  /**
   * Valori memorizzati calcolati una sola volta per evitare ricalcoli su ogni render
   */
  // Verifica se il prodotto è già nella wishlist dell'utente
  const inWishlist = useMemo(() => isInWishlist(product.id), [isInWishlist, product.id]);
  
  // Memorizza il valore dello sconto (se presente)
  const discount = useMemo(() => product.discount || 0, [product.discount]);
  // Memorizza il valore medio delle recensioni
  const rating = useMemo(() => product.rating?.average || 0, [product.rating]);
  // Memorizza il numero totale di recensioni
  const ratingCount = useMemo(() => product.rating?.count || 0, [product.rating]);
  
  return (
    <Card 
      sx={{
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },      }}
      onClick={onProductClick}
    >      
      <Box sx={{ height: 200, bgcolor: '#f5f5f5' }}>
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          height={200}
          retryCount={2}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            name={`rating-${product.id}`}
            value={rating}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({ratingCount})
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {discount > 0 ? (
            <>
              <Typography
                variant="h6"
                color="error"
                sx={{ mr: 1 }}
              >
                ${product.price}
              </Typography>
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              >
                ${product.originalPrice}
              </Typography>
              <Chip
                label={`${discount}% OFF`}
                color="error"
                size="small"
                sx={{ ml: 1 }}
              />
            </>
          ) : (
            <Typography variant="h6" color="primary">
              ${product.price}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={onAddToCart}
          size="small"
        >
          Add to Cart
        </Button>
        <IconButton
          onClick={onToggleWishlist}
          color="primary"
        >
          {inWishlist ? 
            <FavoriteIcon color="error" /> : 
            <FavoriteBorderIcon />
          }
        </IconButton>
      </CardActions>
    </Card>
  );
});

const SearchAndSortControls = memo(({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy 
}) => {
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);
  
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);
  
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search products"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={handleSortChange}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
});

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api.php?path=products`);
      
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format from API");
      }        // Ensure each product has a valid image URL and rating object
      const productsWithValidData = data.map(product => ({
        ...product,
        image: product.image,
        rating: product.rating || { average: 0, count: 0 }
      }));
      
      setProducts(productsWithValidData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = useCallback((product, event) => {
    event.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    addToCart(product);
    setNotification({
      open: true,
      message: `${product.name} added to cart!`,
      severity: 'success'
    });
  }, [addToCart, isAuthenticated, navigate]);

  const handleWishlist = useCallback((product, event) => {
    event.stopPropagation();
    
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    
    try {
      const inWishlist = isInWishlist(product.id);
      
      if (inWishlist) {
        removeFromWishlist(product.id);
        setNotification({
          open: true,
          message: `${product.name} removed from wishlist`,
          severity: 'info'
        });
      } else {
        addToWishlist(product);
        setNotification({
          open: true,
          message: `${product.name} added to wishlist!`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      setNotification({
        open: true,
        message: "Failed to update wishlist. Please try again.",
        severity: 'error'
      });
    }
  }, [addToWishlist, isAuthenticated, isInWishlist, navigate, removeFromWishlist]);

  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [products, searchTerm, sortBy]);

  if (loading) {
    return <ProductsLoading />;
  }

  if (error) {
    return <ProductsError error={error} onRetry={fetchProducts} />;
  }

  return (
    <Container sx={{ py: 8 }}>
      <SearchAndSortControls 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        sortBy={sortBy} 
        setSortBy={setSortBy} 
      />

      <Grid container spacing={4}>
        {filteredAndSortedProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard 
              product={product}
              onAddToCart={(e) => handleAddToCart(product, e)}
              onToggleWishlist={(e) => handleWishlist(product, e)}
              isInWishlist={isInWishlist}
              onProductClick={() => handleProductClick(product.id)}
            />
          </Grid>
        ))}      </Grid>

      {filteredAndSortedProducts.length === 0 && <NoProductsFound />}      {/* Aggiungiamo i componenti di debug solo in ambiente di sviluppo */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <ImageDebugger />
          <ApiTester />
          <ImageUrlTester />
        </>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default memo(Products);
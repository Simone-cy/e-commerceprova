/**
 * Home.jsx
 * 
 * Questo file implementa la pagina principale (homepage) dell'applicazione e-commerce.
 * Presenta una struttura con sezioni contenenti:
 * - Una sezione hero in cima con un'introduzione al negozio
 * - Una sezione "Chi siamo" che descrive il negozio
 * - Una vetrina di prodotti in evidenza
 * - Una sezione con le offerte speciali
 * - Una sezione finale con call-to-action
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useEffect, memo, useCallback, useMemo } from 'react';
// Importazione dei componenti Material-UI
import { Container, Typography, Grid, Card, CardMedia, CardContent, Box, CardActions, Button, Chip, Rating, Skeleton } from '@mui/material';
// Importazione dei componenti di navigazione
import { Link } from 'react-router-dom';
// Importazione delle icone Material-UI
import { ShoppingCart as ShoppingCartIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// Importazione dell'utility per le immagini
import { getProxiedImageUrl } from '../../config/imageUtils';
// Importazione del componente immagine con fallback
import ImageWithFallback from '../ui/ImageWithFallback';
// Immagine SVG di fallback quando l'immagine del prodotto non è disponibile
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999">No Image</text></svg>';

/**
 * Componenti memorizzati (memo) per migliorare le prestazioni
 * Il componente memo evita ri-renderizzazioni non necessarie quando le props non cambiano
 */

/**
 * Sezione hero con sfondo a gradiente colorato in cima alla pagina
 * Mostra il titolo principale del negozio e un breve sottotitolo di benvenuto
 */
const HeroSection = memo(() => (
  <Box 
    sx={{ 
      my: 4, 
      py: 6, 
      borderRadius: 2, 
      backgroundImage: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      color: 'white',
      textAlign: 'center'
    }}
  >
    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
      Benvenuti nel Nostro Negozio
    </Typography>
    <Typography variant="h6" sx={{ maxWidth: '800px', mx: 'auto', px: 2 }}>
      Scopri prodotti incredibili a prezzi imbattibili
    </Typography>
  </Box>
));

/**
 * Sezione informativa "Chi siamo"
 * Fornisce una breve descrizione dell'azienda e dei suoi valori
 */
const AboutSection = memo(() => (
  <Box sx={{ my: 8, textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium' }}>
      Chi Siamo
    </Typography>
    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
      Offriamo la migliore selezione di prodotti a prezzi competitivi.
      Il nostro impegno è fornire un servizio eccezionale e articoli di qualità ai nostri clienti.
      Con spedizioni rapide e un team di supporto dedicato, garantiamo un'esperienza di acquisto senza problemi.
    </Typography>
  </Box>
));

/**
 * Componente card per visualizzare un singolo prodotto
 * Mostra immagine, nome, prezzo, valutazione e sconto (se presente) di un prodotto
 * Include anche un pulsante per visualizzare i dettagli
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Object} props.product - Il prodotto da visualizzare
 * @param {string} props.product.name - Nome del prodotto
 * @param {string} props.product.image - URL dell'immagine del prodotto
 * @param {number} props.product.price - Prezzo del prodotto
 * @param {number} props.product.discount - Percentuale di sconto (opzionale)
 * @param {Object} props.product.rating - Dati sulla valutazione del prodotto
 * @param {Function} props.handleImageError - Funzione per gestire errori nel caricamento dell'immagine
 */
const ProductCard = memo(({ product, handleImageError }) => {
  // Valori memorizzati per evitare calcoli ripetuti ad ogni render
  const discount = useMemo(() => product.discount || 0, [product.discount]);
  const rating = useMemo(() => product.rating?.average || 0, [product.rating]);
  const ratingCount = useMemo(() => product.rating?.count || 0, [product.rating]);
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s',
        position: 'relative',
        ':hover': { 
          transform: 'translateY(-8px)',
          boxShadow: 6
        },
      }}
    >
      {product.trending && (
        <Chip 
          label="Trending"
          color="primary"
          icon={<TrendingUpIcon />}
          sx={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            fontWeight: 'medium'
          }} 
        />
      )}
      {discount > 0 && (
        <Chip 
          label={`${discount}% OFF`}
          color="error"
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            fontWeight: 'bold'
          }} 
        />
      )}
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>        <Box sx={{ height: 200, bgcolor: '#f5f5f5', p: 2 }}>
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            height={200}
            retryCount={2}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" color="text.primary">
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
          {discount > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" color="error" fontWeight="bold">
                ${product.price}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  textDecoration: 'line-through', 
                  color: 'text.secondary',
                  ml: 1 
                }}
              >
                ${product.originalPrice}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="primary" fontWeight="bold">
              ${product.price}
            </Typography>
          )}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              mt: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.description}
          </Typography>
        </CardContent>
      </Link>
      <CardActions sx={{ p: 2, pt: 0, mt: 'auto' }}>
        <Button 
          fullWidth 
          variant="contained" 
          component={Link}
          to={`/products/${product.id}`}
          color="primary"
          startIcon={<ShoppingCartIcon />}
          sx={{ borderRadius: '50px' }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
});

const ProductSkeletonCard = memo(() => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} width="70%" />
      <Skeleton variant="text" height={24} width="40%" />
      <Box sx={{ mt: 1 }}>
        <Skeleton variant="text" height={24} width="60%" />
      </Box>
    </CardContent>
    <Box sx={{ p: 2, mt: 'auto' }}>
      <Skeleton variant="rectangular" height={36} />
    </Box>
  </Card>
));

const ProductsSection = memo(({ loading, trendingProducts, handleImageError }) => {
  return (
    <Box sx={{ my: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="medium">
            Trending Products
          </Typography>
        </Box>
        <Button 
          component={Link} 
          to="/products" 
          variant="outlined" 
          color="primary"
        >
          View All Products
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {loading ? (
          // Skeleton loading state
          Array.from(new Array(4)).map((_, index) => (
            <Grid item key={`skeleton-${index}`} xs={12} sm={6} md={3}>
              <ProductSkeletonCard />
            </Grid>
          ))
        ) : (
          trendingProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={3}>
              <ProductCard 
                product={product}
                handleImageError={handleImageError}
              />
            </Grid>
          ))
        )}
      </Grid>
      
      {trendingProducts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No trending products available
          </Typography>
        </Box>
      )}
    </Box>
  );
});

/**
 * Componente principale della homepage
 * Gestisce il caricamento dei prodotti in evidenza e la visualizzazione delle diverse sezioni
 */
function Home() {
  // Stato per i prodotti in evidenza e lo stato di caricamento
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Recupera i prodotti in evidenza dal server
   * Filtra i prodotti per mostrare solo quelli contrassegnati come "trending"
   */
  const fetchTrendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api.php?path=products`);
      
      if (!response.ok) {
        throw new Error(`Errore durante il recupero dei prodotti: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', data);
        setTrendingProducts([]);
        return;
      }
      
      // Filter trending products
      const actualTrendingProducts = data.filter(product => product.trending === true);
      
      // Limit to 4 trending products
      const trendingToShow = actualTrendingProducts.slice(0, 4);
      
      // Fallback to first 4 products if no trending products
      const productsToProcess = trendingToShow.length > 0 ? trendingToShow : data.slice(0, 4);
        // Process products to ensure image and rating are handled correctly
      const finalProductsToDisplay = productsToProcess.map(product => ({
        ...product,
        image: product.image,
        rating: product.rating || { average: 0, count: 0 }
      }));
      
      setTrendingProducts(finalProductsToDisplay);
    } catch (error) {
      console.error('Error fetching products:', error);
      setTrendingProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingProducts();
  }, [fetchTrendingProducts]);

  // Enhanced error handling function with multiple fallbacks
  const handleImageError = useCallback((e) => {
    if (e.target.src !== FALLBACK_IMAGE) {
      // Try the placehold.co service first
      e.target.src = 'https://placehold.co/200x200/CCCCCC/666666?text=No+Image';
      
      // Add another event listener to catch if the placeholder also fails
      e.target.onerror = () => {
        e.target.src = FALLBACK_IMAGE;
        e.target.onerror = null; // Prevent infinite loop
      };
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <HeroSection />
      <AboutSection />
      <ProductsSection 
        loading={loading} 
        trendingProducts={trendingProducts}
        handleImageError={handleImageError}
      />
    </Container>
  );
}

export default memo(Home);

/**
 * Home.jsx: Pagina principale (homepage) dell'e-commerce.
 * Mostra sezioni hero, "Chi siamo", prodotti in evidenza e offerte.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useEffect, memo, useCallback, useMemo } from 'react';
// Importazione dei componenti Material-UI
import { Container, Typography, Grid, Card, CardMedia, CardContent, Box, CardActions, Button, Chip, Rating, Skeleton } from '@mui/material';
// Importazione dei componenti di navigazione
import { Link, useNavigate } from 'react-router-dom';
// Importazione delle icone Material-UI
import { ShoppingCart as ShoppingCartIcon, TrendingUp as TrendingUpIcon, Visibility as VisibilityIcon } from '@mui/icons-material'; // Added VisibilityIcon for clarity if needed

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// Importazione dell'utility per le immagini
import { getProxiedImageUrl } from '../../config/imageUtils';
// Importazione del componente immagine con fallback
import ImageWithFallback from '../ui/ImageWithFallback';
// Immagine SVG di fallback quando l'immagine del prodotto non è disponibile
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999">No Image</text></svg>';

/**
 * Sezione Hero: Intestazione principale della homepage.
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
HeroSection.displayName = 'HeroSection'; // displayName per React.memo

/**
 * Sezione Chi Siamo: Descrizione breve del negozio.
 */
const AboutSection = memo(() => (
  <Box sx={{ my: 4, py: 4, textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
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
AboutSection.displayName = 'AboutSection'; // displayName per React.memo

/**
 * Componente Card Prodotto: Visualizza un singolo prodotto.
 * Mostra immagine, nome, prezzo, valutazione e sconto (se presente).
 * Include un pulsante per visualizzare i dettagli del prodotto.
 * 
 * @param {Object} props - Proprietà del componente.
 * @param {Object} props.product - Dati del prodotto da visualizzare.
 */
const ProductCard = memo(({ product }) => { 
  const rating = useMemo(() => product.rating?.average || 0, [product.rating]);
  const ratingCount = useMemo(() => product.rating?.count || 0, [product.rating]);
  const discount = useMemo(() => parseFloat(product.discount) || 0, [product.discount]);
  const price = useMemo(() => parseFloat(product.price) || 0, [product.price]);

  const discountedPrice = useMemo(() => {
    if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  }, [price, discount]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6, // MUI elevation shorthand for a deeper shadow
        },
        position: 'relative', // Ensure Card is stacking context for Chips
      }}
    >
      {product.trending && (
        <Chip
          label="Trending"
          color="primary"
          icon={<TrendingUpIcon />}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontWeight: 'medium',
            zIndex: 1, // Ensure chip is on top
          }}
        />
      )}
      {discount > 0 && (
        <Chip
          label={`${discount}% OFF`}
          color="error" // Using "error" for discount, which is typically red
          size="small"
          sx={{
            position: 'absolute',
            top: product.trending ? 38 : 8, // Adjust if trending chip is also present
            right: 8,
            fontWeight: 'bold',
            zIndex: 1, // Ensure chip is on top
          }}
        />
      )}
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' /* Ensure link takes up block space */ }}>
        {/* Image container Box */}
        <Box
          sx={{
            // Removed fixed height. Height will be determined by ImageWithFallback + padding.
            bgcolor: '#f5f5f5', // Background for the padding area and image container
            p: 2, // Padding around the ImageWithFallback component
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            // overflow: 'hidden', // Not strictly necessary here as ImageWithFallback handles its own overflow
          }}
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            height={200} // The actual image area will be 200px high
            width="100%"  // ImageWithFallback will take full width of parent's content area
            retryCount={3}
          />
        </Box>
      </Link>
      <CardContent sx={{ flexGrow: 1, pt: 2 /* Adjusted padding */ }}>
        <Typography gutterBottom variant="h6" component="div" noWrap title={product.name}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating name="read-only" value={rating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            ({ratingCount})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', minHeight: '2.5em' /* Ensure consistent height */ }}>
          <Typography variant="h6" color="primary.main" sx={{ mr: discount > 0 ? 1 : 0 }}>
            ${discountedPrice.toFixed(2)}
          </Typography>
          {discount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              ${price.toFixed(2)}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: '3em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={product.short_description || product.description}>
          {product.short_description || product.description || 'View details for more information.'}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2, mt: 'auto' /* Push actions to bottom */ }}>
        <Button component={Link} to={`/products/${product.id}`} variant="contained" size="medium" startIcon={<VisibilityIcon />}>
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

/**
 * Sezione Prodotti: Mostra i prodotti (es. in evidenza).
 * @param {Object} props Props del componente.
 * @param {boolean} props.loading Stato di caricamento.
 * @param {Array} props.trendingProducts Array di prodotti da visualizzare.
 */
const ProductsSection = memo(({ loading, trendingProducts }) => {
  const navigate = useNavigate();
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
                // handleImageError prop was unused and can be removed from ProductCard definition
              />
            </Grid>
          ))
        }
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
ProductsSection.displayName = 'ProductsSection'; // displayName per React.memo

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
      />
    </Container>
  );
}

export default memo(Home);

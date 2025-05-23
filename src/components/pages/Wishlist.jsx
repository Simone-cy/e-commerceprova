/**
 * Componente Wishlist
 * 
 * Questo componente implementa la lista dei desideri dell'utente con doppia modalità:
 * - Modalità privata: l'utente visualizza e gestisce la propria lista desideri
 * - Modalità pubblica: gli utenti possono visualizzare liste desideri condivise da altri
 * 
 * Funzionalità principali:
 * - Visualizzazione di prodotti salvati
 * - Aggiunta al carrello direttamente dalla wishlist
 * - Rimozione di prodotti dalla propria wishlist
 * - Condivisione della wishlist tramite link pubblico
 * 
 * @module components/pages/Wishlist
 */

// Importazione degli hook React per gestione stato, effetti collaterali e ottimizzazioni
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
// Importazione dei contesti per accedere ai vari stati globali dell'applicazione
import { WishlistContext } from '../../contexts/WishlistContext';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
// Importazione dei componenti di routing per navigazione e accesso ai parametri URL
import { useNavigate, useParams } from 'react-router-dom';
// Importazione dei componenti Material-UI per l'interfaccia utente
import {
  Container,     // Contenitore principale con larghezza massima
  Typography,    // Componenti tipografici per titoli e testi
  Grid,          // Sistema a griglia per layout responsivo
  Card,          // Card per visualizzare i singoli prodotti
  CardContent,   // Contenuto delle card
  CardMedia,     // Componente per immagini nelle card
  CardActions,   // Area per azioni/bottoni nelle card
  Button,        // Pulsanti standard
  IconButton,    // Pulsanti con icone
  Box,           // Contenitore flessibile per layout
  Snackbar,      // Notifica temporanea
  Alert,         // Componente per messaggi di errore/successo
  Skeleton       // Placeholder per contenuti in caricamento
} from '@mui/material';
// Importazione delle icone Material-UI
import {
  Delete as DeleteIcon,                 // Icona per eliminazione
  ShoppingCart as ShoppingCartIcon,      // Icona del carrello
  Share as ShareIcon                     // Icona di condivisione
} from '@mui/icons-material';

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// Importazione dell'utility per la gestione delle immagini con proxy
import { getProxiedImageUrl } from '../../config/imageUtils';
// Importazione del componente personalizzato per immagini con gestione errori
import ImageWithFallback from '../ui/ImageWithFallback';

/**
 * Componente principale per la visualizzazione e gestione della lista desideri
 * 
 * Questo componente può funzionare in due modalità:
 * 1. Lista desideri personale: quando l'utente visualizza la propria lista
 * 2. Lista desideri condivisa: quando si visualizza la lista di un altro utente
 * 
 * La modalità è determinata dalla presenza di un userId nell'URL.
 * 
 * @returns {JSX.Element} Il componente renderizzato della lista desideri
 */
function Wishlist() {
  // Accesso al contesto della wishlist per gestire la lista personale
  const { wishlist: privateWishlist, removeFromWishlist } = useContext(WishlistContext);
  // Accesso al contesto del carrello per aggiungere prodotti direttamente
  const { addToCart } = useContext(CartContext);
  // Accesso al contesto di autenticazione per informazioni sull'utente corrente
  const { user } = useContext(AuthContext);
  // Hook per la navigazione programmatica tra pagine
  const navigate = useNavigate();
  // Estrazione del parametro userId dall'URL per liste desideri condivise
  const { userId } = useParams();
  
  /**
   * Stati per gestire i dati e l'interfaccia utente
   * 
   * Mantengono lo stato locale del componente per:
   * - Dati delle liste desideri (personale o condivisa)
   * - Informazioni di visualizzazione e feedback utente
   * - Gestione stati di caricamento ed errori
   */
  const [currentWishlist, setCurrentWishlist] = useState([]); // Prodotti nella lista attualmente visualizzata
  const [isLoading, setIsLoading] = useState(true);           // Stato di caricamento dei dati
  const [userName, setUserName] = useState('Utente');         // Nome dell'utente proprietario della lista
  const [isPublicView, setIsPublicView] = useState(false);    // Modalità di visualizzazione (pubblica/privata)
  const [error, setError] = useState(null);                   // Messaggi di errore da mostrare
  const [shareSuccess, setShareSuccess] = useState(false);    // Feedback per azione di condivisione avvenuta
    // URL pubblico memorizzato per condividere la lista desideri
  // Viene ricalcolato solo quando cambia l'ID utente
  const publicShareUrl = useMemo(() => {
    if (user?.id) {
      return `${window.location.origin}/wishlist/${user.id}`;
    }
    return null;
  }, [user?.id]);
  
  // Funzione per recuperare i dati di una lista desideri pubblica
  useEffect(() => {
    if (!userId) {
      setIsPublicView(false);
      setCurrentWishlist(privateWishlist);
      setUserName(user?.nome || "My");
      setIsLoading(false);
      return;
    }
    
    setIsPublicView(true);
    setIsLoading(true);
    setError(null);
    
    fetch(`${API_BASE_URL}/api.php?path=public-wishlist&userId=${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setCurrentWishlist(data.items || []);
          setUserName(data.userName || `User ${userId}`);
        } else {
          const errorMsg = data.error || 'Non è stato possibile caricare la wishlist';
          console.error('Error fetching public wishlist:', errorMsg);
          setError(errorMsg);
          setCurrentWishlist([]);
          setUserName(`User ${userId}`);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching public wishlist:', error);
        setError('Si è verificato un errore nel caricamento della wishlist. Riprova più tardi.');
        setCurrentWishlist([]);
        setUserName('User');
        setIsLoading(false);
      });
  }, [userId, privateWishlist, user]);
  // Handler functions with useCallback for better performance
  const handleShareWishlist = useCallback(() => {
    if (!publicShareUrl) {
      alert('Devi essere connesso per condividere la tua wishlist.');
      return;
    }
    
    navigator.clipboard.writeText(publicShareUrl)
      .then(() => {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Non è stato possibile copiare il link. Riprova.');
      });
  }, [publicShareUrl]);

  const handleAddToCart = useCallback((product) => {
    addToCart(product);
    if (!isPublicView) {
      removeFromWishlist(product.id);
    }
  }, [addToCart, removeFromWishlist, isPublicView]);

  const handleCloseSnackbar = useCallback(() => setShareSuccess(false), []);

  // Components for better organization
  const LoadingState = () => (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Loading Wishlist...</Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {[1, 2, 3].map((item) => (
          <Grid item key={item} xs={12} sm={6} md={4}>
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
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  const ErrorState = ({ error, navigate }) => (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom color="error">
        {error}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Non è stato possibile caricare la wishlist. Verifica che l'URL sia corretto.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/products')}
        sx={{ mt: 2 }}
      >
        Sfoglia i Prodotti
      </Button>
    </Container>
  );

  const EmptyWishlist = ({ isPublicView, userName, navigate }) => (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        {isPublicView ? `${userName}'s wishlist is empty or not found` : 'Your wishlist is empty'}
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/products')}
        sx={{ mt: 2 }}
      >
        Browse Products
      </Button>
    </Container>
  );

  const ProductCard = ({ product, isPublicView, onAddToCart, onRemove }) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}>
      <Box sx={{ height: 200, bgcolor: '#f5f5f5', p: 2 }}>
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
        <Typography variant="h6" color="primary">
          ${product.price}
        </Typography>
        {product.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => onAddToCart(product)}
          sx={{ borderRadius: '8px' }}
        >
          Add to Cart
        </Button>
        {!isPublicView && (
          <IconButton
            color="error"
            onClick={() => onRemove(product.id)}
            aria-label="Delete from wishlist"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} navigate={navigate} />;
  }

  if (currentWishlist.length === 0) {
    return <EmptyWishlist isPublicView={isPublicView} userName={userName} navigate={navigate} />;
  }

  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          {isPublicView ? `${userName}'s Wishlist` : 'My Wishlist'}
        </Typography>
        {!isPublicView && (
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShareWishlist}
            color={shareSuccess ? "success" : "primary"}
          >
            {shareSuccess ? 'Link Copiato!' : 'Share My Wishlist'}
          </Button>
        )}
      </Box>

      {isPublicView && (
        <Card sx={{ mb: 4, p: 3, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Questa è la wishlist condivisa di {userName}
          </Typography>
          <Typography variant="body1">
            Stai visualizzando gli articoli che {userName} desidera. Se vuoi fargli un regalo, aggiungi gli articoli al tuo carrello e completalo l'ordine!
          </Typography>
          {user && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/wishlist')}
            >
              Vai alla tua wishlist
            </Button>
          )}
        </Card>
      )}

      <Grid container spacing={4}>
        {currentWishlist.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard 
              product={product} 
              isPublicView={isPublicView} 
              onAddToCart={handleAddToCart} 
              onRemove={removeFromWishlist}
            />
          </Grid>
        ))}      </Grid>

      <Snackbar 
        open={shareSuccess} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" variant="filled">
          Link alla wishlist copiato negli appunti! Condividilo con i tuoi amici.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Wishlist;
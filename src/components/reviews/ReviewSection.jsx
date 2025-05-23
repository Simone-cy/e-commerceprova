/**
 * ReviewSection.jsx
 * 
 * Questo componente implementa la sezione di recensioni per i prodotti dell'e-commerce.
 * Fornisce un'interfaccia completa per visualizzare, aggiungere e gestire le recensioni
 * dei prodotti, con funzionalità di valutazione a stelle e commenti testuali.
 * 
 * Funzionalità principali:
 * - Visualizzazione delle recensioni esistenti per un prodotto specifico
 * - Form per l'aggiunta di nuove recensioni (solo per utenti autenticati)
 * - Calcolo e visualizzazione della valutazione media del prodotto
 * - Filtraggio e ordinamento delle recensioni per utilità o data
 * - Gestione di stati di caricamento ed errori durante le operazioni AJAX
 */

// Importazione degli hook e delle utilità React necessarie per gestire stato e comportamenti
import { useState, useContext, useEffect, useCallback, memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// Importazione dei componenti Material-UI per l'interfaccia utente
import {
  Box, Typography, Paper, Divider, Rating, TextField, Button,
  Avatar, Card, CardContent, CircularProgress, Grid, Alert, IconButton
} from '@mui/material';
// Importazione delle icone Material-UI
import { Star as StarIcon, Refresh as RefreshIcon } from '@mui/icons-material';
// Importazione del contesto per le recensioni
import { ReviewContext } from '../../contexts/ReviewContext';
// Importazione del contesto di autenticazione
import { AuthContext } from '../../contexts/AuthContext';

/**
 * Componente per visualizzare una singola recensione
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Object} props.review - Dati della recensione da mostrare
 * @param {number} props.currentUserId - ID dell'utente attualmente autenticato
 * @param {Function} props.onDeleteReview - Funzione per gestire l'eliminazione della recensione
 */
const Review = memo(({ review, currentUserId, onDeleteReview }) => (
  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Avatar con l'iniziale del nome utente */}
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box>
            {/* Nome dell'utente che ha lasciato la recensione */}
            <Typography variant="subtitle1">{review.userName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Stelline di valutazione in sola lettura */}
              <Rating value={review.rating} readOnly precision={0.5} size="small" />
              {/* Data della recensione formattata */}
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                {new Date(review.date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Mostra il pulsante elimina solo se l'utente è autore della recensione */}
        {currentUserId && review.userId === currentUserId && (
          <Button 
            size="small" 
            color="error" 
            onClick={() => onDeleteReview(review.id)}
          >
            Elimina
          </Button>
        )}
      </Box>
      {/* Testo della recensione, mostrato solo se presente */}
      {review.comment && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          {review.comment}
        </Typography>
      )}
    </CardContent>
  </Card>
));

/**
 * Componente per il form di inserimento/aggiornamento recensione
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Object} props.userReview - Stato della recensione dell'utente
 * @param {boolean} props.hasUserReviewed - Indica se l'utente ha già recensito
 * @param {boolean} props.isSubmittingReview - Indica se è in corso l'invio della recensione
 * @param {boolean} props.isAuthenticated - Indica se l'utente è autenticato
 * @param {Function} props.handleRatingChange - Gestore per il cambio valutazione
 * @param {Function} props.handleCommentChange - Gestore per il cambio commento
 * @param {Function} props.handleSubmitReview - Gestore per l'invio della recensione
 */
const ReviewForm = memo(({ 
  userReview, 
  hasUserReviewed, 
  isSubmittingReview, 
  isAuthenticated,
  handleRatingChange,
  handleCommentChange,
  handleSubmitReview
}) => {
  // Se l'utente non è autenticato, mostra messaggio di login
  if (!isAuthenticated) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Per favore <RouterLink to="/login" style={{ textDecoration: 'none' }}>accedi</RouterLink> per lasciare una recensione.
      </Alert>
    );
  }
  
  // Form per utenti autenticati
  return (
    <Box component="form" onSubmit={handleSubmitReview} sx={{ mb: 4 }}>
      <Typography variant="subtitle1" gutterBottom>
        {hasUserReviewed ? 'Aggiorna la tua recensione' : 'Lascia una recensione'}
      </Typography>
      {/* Selezione stelline per la valutazione */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Rating
          name="product-rating"
          value={userReview.rating}
          onChange={handleRatingChange}
          precision={0.5}
          size="large"
        />
        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
          {userReview.rating > 0 ? `${userReview.rating}/5` : 'Seleziona valutazione'}
        </Typography>
      </Box>
      {/* Campo di testo per il commento */}
      <TextField
        fullWidth
        multiline
        rows={4}
        label="La tua recensione (opzionale)"
        value={userReview.comment}
        onChange={handleCommentChange}
        sx={{ mb: 2 }}
      />
      {/* Pulsante per inviare la recensione */}
      <Button 
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmittingReview || userReview.rating === 0}
      >
        {isSubmittingReview ? 'Invio in corso...' : hasUserReviewed ? 'Aggiorna recensione' : 'Invia recensione'}
      </Button>
    </Box>
  );
});

/**
 * Componente per l'elenco delle recensioni
 * 
 * @param {Object} props - Proprietà del componente
 * @param {Array} props.reviews - Array di recensioni da visualizzare
 * @param {boolean} props.loading - Indica se è in corso il caricamento delle recensioni
 * @param {number} props.currentUserId - ID dell'utente attualmente autenticato
 * @param {Function} props.onDeleteReview - Funzione per gestire l'eliminazione della recensione
 */
const ReviewsList = memo(({ reviews, loading, currentUserId, onDeleteReview }) => {
  // Se le recensioni sono in caricamento, mostra spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Se non ci sono recensioni, mostra messaggio
  if (reviews.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Nessuna recensione ancora. Sii il primo a recensire questo prodotto!
        </Typography>
      </Box>
    );
  }
  
  // Visualizza la lista delle recensioni
  return (
    <Grid container spacing={3}>
      {reviews.map((review) => (
        <Grid item xs={12} key={review.id}>
          <Review 
            review={review} 
            currentUserId={currentUserId}
            onDeleteReview={onDeleteReview}
          />
        </Grid>
      ))}
    </Grid>
  );
});

/**
 * Componente principale per la sezione recensioni di un prodotto
 * 
 * @param {Object} props - Proprietà del componente
 * @param {number} props.productId - ID del prodotto di cui mostrare le recensioni
 */
function ReviewSection({ productId }) {
  // Accesso ai contesti di autenticazione e recensioni
  const { isAuthenticated, user, token } = useContext(AuthContext);
  const { 
    reviews, stats, loading, error,
    fetchReviews, addReview, updateReview, deleteReview,
    hasUserReviewed, getUserReview
  } = useContext(ReviewContext);
  
  // State per il form di recensione
  const [userReview, setUserReview] = useState({ rating: 0, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [notification, setNotification] = useState({ message: '', severity: 'success' });
  const [showNotification, setShowNotification] = useState(false);
  
  // Effetto per caricare le recensioni quando cambia l'ID del prodotto
  useEffect(() => {
    if (productId) {
      fetchReviews(productId);
    }
  }, [productId, fetchReviews]);
  
  // Effetto per ricaricare periodicamente le recensioni (aggiornamento automatico)
  useEffect(() => {
    // Carica inizialmente le recensioni
    if (productId) {
      fetchReviews(productId);
    }
    
    // Ricarica le recensioni ogni 30 secondi per mantenere i dati sincronizzati
    const intervalId = setInterval(() => {
      if (productId) {
        fetchReviews(productId);
      }
    }, 30000); // 30 secondi
    
    // Pulisci l'intervallo quando il componente viene smontato o il productId cambia
    return () => clearInterval(intervalId);
  }, [productId, fetchReviews]);

  // Controlla se l'utente ha già recensito il prodotto e imposta il form di conseguenza
  useEffect(() => {
    // Reset del form ogni volta che cambia il prodotto
    setUserReview({ rating: 0, comment: '' });
    
    // Se l'utente è autenticato, verifica se ha già recensito questo prodotto
    if (isAuthenticated && user && reviews.length > 0) {
      const userHasReviewed = hasUserReviewed(productId);
      
      if (userHasReviewed) {
        const existingReview = getUserReview(productId);
        if (existingReview) {
          setUserReview({
            rating: existingReview.rating,
            comment: existingReview.comment || ''
          });
        }
      }
    }
  }, [isAuthenticated, user, reviews, productId, hasUserReviewed, getUserReview]);
  
  // Handler per il cambio di valutazione a stelline
  const handleRatingChange = useCallback((event, newValue) => {
    setUserReview(prev => ({ ...prev, rating: newValue }));
  }, []);
  
  // Handler per il cambio di commento nel campo di testo
  const handleCommentChange = useCallback((e) => {
    setUserReview(prev => ({ ...prev, comment: e.target.value }));
  }, []);
  
  // Handler per l'invio della recensione (nuovo inserimento o aggiornamento)
  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    
    // Verifica se l'utente è autenticato
    if (!isAuthenticated()) {
      setNotification({
        message: 'Per favore accedi per lasciare una recensione',
        severity: 'warning'
      });
      setShowNotification(true);
      return;
    }
    
    // Verifica che sia stata selezionata una valutazione
    if (userReview.rating === 0) {
      setNotification({
        message: 'Per favore seleziona una valutazione',
        severity: 'warning'
      });
      setShowNotification(true);
      return;
    }
    
    // Imposta stato di invio in corso
    setIsSubmittingReview(true);
    
    try {
      // Prepara i dati della recensione
      const reviewData = {
        productId,
        rating: userReview.rating,
        comment: userReview.comment
      };
      
      // Determina se è una nuova recensione o un aggiornamento
      const isExistingReview = hasUserReviewed(productId);
      let success;
      
      if (isExistingReview) {
        // Aggiornamento di una recensione esistente
        const userReviewObj = getUserReview(productId);
        reviewData.reviewId = userReviewObj.id;
        success = await updateReview(reviewData);
      } else {
        // Inserimento di una nuova recensione
        success = await addReview(reviewData);
      }
      
      // Gestione della risposta
      if (success) {
        setNotification({
          message: isExistingReview ? 'Recensione aggiornata con successo!' : 'Recensione aggiunta con successo!',
          severity: 'success'
        });
      } else {
        throw new Error('Operazione non riuscita');
      }
      
      // Mostra notifica di successo
      setShowNotification(true);
    } catch (error) {
      // Gestione errore e mostra notifica
      setNotification({
        message: `Errore: ${error.message || 'Si è verificato un errore'}`,
        severity: 'error'
      });
      setShowNotification(true);
    } finally {
      // Ripristina stato di invio al termine
      setIsSubmittingReview(false);
    }
  }, [
    userReview, isAuthenticated, productId, 
    hasUserReviewed, getUserReview, addReview, updateReview
  ]);
  
  // Funzione per gestire l'eliminazione di una recensione
  const handleDeleteReview = useCallback(async (reviewId) => {
    // Chiedi conferma prima di eliminare
    if (window.confirm('Sei sicuro di voler eliminare questa recensione?')) {
      // Esegui l'eliminazione
      const success = await deleteReview(reviewId);
      
      // Gestione risposta e notifiche
      if (success) {
        setNotification({
          message: 'Recensione eliminata con successo!',
          severity: 'success'
        });
      } else {
        setNotification({
          message: 'Impossibile eliminare la recensione. Riprova.',
          severity: 'error'
        });
      }
      
      // Mostra notifica
      setShowNotification(true);
    }
  }, [deleteReview]);
  
  // Handler per aggiornare manualmente le recensioni tramite pulsante refresh
  const handleRefreshReviews = useCallback(() => {
    if (productId) {
      fetchReviews(productId);
    }
  }, [productId, fetchReviews]);

  // Rendering del componente completo di sezione recensioni
  return (
    <Paper elevation={1} sx={{ mt: 6, p: 3 }}>
      {/* Intestazione con titolo, valutazione media e pulsante refresh */}
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StarIcon sx={{ mr: 1, color: 'gold' }} />
          Recensioni
          {/* Mostra valutazione media e conteggio recensioni se presenti */}
          {stats.count > 0 && (
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <Rating value={stats.average} readOnly precision={0.5} size="small" />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                ({stats.average.toFixed(1)}/5, {stats.count} {stats.count === 1 ? 'recensione' : 'recensioni'})
              </Typography>
            </Box>
          )}
        </Box>
        {/* Pulsante per aggiornare manualmente le recensioni */}
        <IconButton onClick={handleRefreshReviews} disabled={loading} title="Aggiorna recensioni">
          <RefreshIcon />
        </IconButton>
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {/* Mostro eventuali errori */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Notifica per feedback utente (successo, errore) */}
      {showNotification && (
        <Alert 
          severity={notification.severity} 
          onClose={() => setShowNotification(false)}
          sx={{ mb: 3 }}
        >
          {notification.message}
        </Alert>
      )}
      
      {/* Form per inserire o aggiornare la propria recensione */}
      <ReviewForm
        userReview={userReview}
        hasUserReviewed={hasUserReviewed(productId)}
        isSubmittingReview={isSubmittingReview}
        isAuthenticated={isAuthenticated()}
        handleRatingChange={handleRatingChange}
        handleCommentChange={handleCommentChange}
        handleSubmitReview={handleSubmitReview}
      />
      
      <Divider sx={{ my: 3 }} />
      
      {/* Intestazione della lista recensioni */}
      <Typography variant="h6" gutterBottom>
        {reviews.length} {reviews.length === 1 ? 'Recensione' : 'Recensioni'}
      </Typography>
      
      {/* Lista di tutte le recensioni */}
      <ReviewsList 
        reviews={reviews} 
        loading={loading}
        currentUserId={user?.id}
        onDeleteReview={handleDeleteReview}
      />
    </Paper>
  );
}

// Esporta il componente con ottimizzazione memo per prevenire render non necessari
export default memo(ReviewSection);

/**
 * Contesto per la gestione delle recensioni dei prodotti.
 * Fornisce funzionalità per recuperare, aggiungere, aggiornare ed eliminare recensioni.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, createContext, useContext, useCallback, useMemo } from 'react';
// Importazione del contesto di autenticazione per accedere ai dati dell'utente
import { AuthContext } from './AuthContext';
// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../config/api';

/**
 * Contesto React per le recensioni.
 */
export const ReviewContext = createContext();

/**
 * Provider per il contesto Recensioni.
 * Gestisce stato e interazioni delle recensioni.
 * @param {Object} props Props del componente.
 * @param {React.ReactNode} props.children Componenti figli.
 */
export function ReviewProvider({ children }) {
  // Accesso al contesto di autenticazione per ottenere i dati dell'utente
  const { isAuthenticated, user, token } = useContext(AuthContext);
  // Stato per memorizzare le recensioni correnti per un prodotto
  const [reviews, setReviews] = useState([]);
  // Stato per memorizzare le statistiche di recensione per un prodotto (media, conteggio)
  const [stats, setStats] = useState({ average: 0, count: 0 });
  // Stato per memorizzare l'ID del prodotto corrente
  const [currentProductId, setCurrentProductId] = useState(null);
  // Stato per gestire lo stato di caricamento durante le operazioni asincrone
  const [loading, setLoading] = useState(false);
  // Stato per gestire eventuali errori durante le operazioni
  const [error, setError] = useState(null);

  /**
   * Recupera le recensioni per un prodotto specifico.
   * @param {number} productId ID del prodotto.
   * @returns {Promise<void>}
   */
  const fetchReviews = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=reviews&productId=${productId}`);
      
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
        setStats(data.stats || { average: 0, count: 0 });
        setCurrentProductId(productId);
      } else {
        throw new Error(data.error || 'Impossibile recuperare le recensioni');
      }
    } catch (err) {
      setError(err.message);
      console.error('Errore nel recupero delle recensioni:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aggiunge una nuova recensione.
   * @param {Object} reviewData Dati della recensione (productId, rating, comment).
   * @returns {Promise<boolean>} True se l'operazione ha successo.
   */
  const addReview = useCallback(async (reviewData) => {
    if (!isAuthenticated() || !token) {
      setError('Devi essere autenticato per aggiungere una recensione');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Impossibile aggiungere la recensione');
      }

      // Aggiorna le recensioni dopo l'aggiunta con successo
      if (currentProductId === reviewData.productId) {
        await fetchReviews(reviewData.productId);
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Errore nell\'aggiunta della recensione:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, currentProductId, fetchReviews]);

  /**
   * Aggiorna una recensione esistente.
   * @param {Object} reviewData Dati della recensione (reviewId, rating, comment).
   * @returns {Promise<boolean>} True se l'operazione ha successo.
   */
  const updateReview = useCallback(async (reviewData) => {
    if (!isAuthenticated() || !token) {
      setError('Devi essere autenticato per aggiornare una recensione');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Impossibile aggiornare la recensione');
      }

      // Aggiorna le recensioni dopo l'aggiornamento con successo
      if (currentProductId) {
        await fetchReviews(currentProductId);
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Errore nell\'aggiornamento della recensione:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, currentProductId, fetchReviews]);
  /**
   * Elimina una recensione.
   * @param {number} reviewId ID della recensione da eliminare.
   * @returns {Promise<boolean>} True se l'operazione ha successo.
   */
  const deleteReview = useCallback(async (reviewId) => {
    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) {
      setError('Devi essere autenticato per eliminare una recensione');
      return false;
    }

    // Imposta lo stato di caricamento e resetta eventuali errori precedenti
    setLoading(true);
    setError(null);

    try {
      // Effettua la richiesta DELETE al server per eliminare la recensione
      const response = await fetch(`${API_BASE_URL}/api.php?path=reviews`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewId })
      });      
      const data = await response.json();

      // Controlla se l'operazione ha avuto successo
      if (!data.success) {
        throw new Error(data.error || 'Impossibile eliminare la recensione');
      }

      // Aggiorna immediatamente lo stato locale prima di richiedere l'aggiornamento completo
      setReviews(prevReviews => {
        const updatedReviews = prevReviews.filter(review => review.id !== reviewId);
        // Ricalcola le statistiche localmente
        const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
        const newAverage = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;
        setStats({
          average: newAverage,
          count: updatedReviews.length
        });
        return updatedReviews;
      });

      // Richiedi un aggiornamento completo dal server per sincronizzare i dati
      if (currentProductId) {
        await fetchReviews(currentProductId);
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Errore nell\'eliminazione della recensione:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, currentProductId, fetchReviews]);
  /**
   * Verifica se l'utente autenticato ha già recensito un prodotto.
   * @param {number} productId ID del prodotto.
   * @returns {boolean} True se l'utente ha già recensito.
   */
  const hasUserReviewed = useCallback((productId) => {
    // Se l'utente non è autenticato o non abbiamo i dati utente, non può aver recensito
    if (!isAuthenticated() || !user) return false;
    
    // Verifico che la recensione sia dell'utente corrente E per il prodotto specificato
    // Se il currentProductId è diverso da productId, ritorno false perché stiamo visualizzando un altro prodotto
    return currentProductId === parseInt(productId) && reviews.some(review => review.userId === user.id);
  }, [isAuthenticated, user, reviews, currentProductId]);  /**
   * Ottiene la recensione dell'utente corrente per un prodotto.
   * @param {number} productId ID del prodotto.
   * @returns {Object|null} La recensione dell'utente o null.
   */
  const getUserReview = useCallback((productId) => {
    // Se l'utente non è autenticato o non abbiamo i dati utente, non può avere recensioni
    if (!isAuthenticated() || !user) return null;
    
    // Verifico che siamo nel contesto del prodotto corretto prima di cercare la recensione
    if (currentProductId !== parseInt(productId)) return null;
    
    // Cerco e restituisco la recensione dell'utente corrente per questo prodotto
    return reviews.find(review => review.userId === user.id) || null;
  }, [isAuthenticated, user, reviews, currentProductId]);

  /**
   * Valore memoizzato del contesto per ottimizzare le performance.
   */
  const contextValue = useMemo(() => ({
    reviews,                // Array di recensioni per il prodotto corrente
    stats,                  // Statistiche delle recensioni (media, conteggio)
    loading,                // Stato di caricamento
    error,                  // Eventuali errori
    fetchReviews,           // Funzione per recuperare le recensioni
    addReview,              // Funzione per aggiungere una recensione
    updateReview,           // Funzione per aggiornare una recensione
    deleteReview,           // Funzione per eliminare una recensione
    hasUserReviewed,        // Funzione per verificare se l'utente ha già recensito
    getUserReview,          // Funzione per ottenere la recensione dell'utente corrente
    currentProductId        // ID del prodotto corrente
  }), [
    reviews,
    stats,
    loading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
    hasUserReviewed,
    getUserReview,
    currentProductId
  ]);

  /**
   * Render del provider che fornisce il contesto ai componenti figli.
   */
  return (
    <ReviewContext.Provider value={contextValue}>
      {children}
    </ReviewContext.Provider>
  );
}

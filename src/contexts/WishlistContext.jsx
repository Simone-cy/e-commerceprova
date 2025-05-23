
/**
 * WishlistContext.jsx
 * 
 * Questo file implementa il contesto per la gestione della lista desideri (wishlist)
 * dell'utente nell'applicazione e-commerce. Fornisce funzionalità per recuperare, 
 * aggiungere e rimuovere prodotti dalla wishlist, con aggiornamenti ottimistici 
 * dell'interfaccia utente e rollback in caso di errori.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
// Importazione del contesto di autenticazione per accedere ai dati dell'utente
import { AuthContext } from './AuthContext';
// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../config/api';

/**
 * Creazione del contesto per la wishlist
 * Sarà utilizzato per fornire funzionalità di wishlist a tutta l'applicazione
 */
export const WishlistContext = createContext();

/**
 * Provider del contesto per la wishlist
 * Gestisce lo stato della wishlist e fornisce metodi per interagire con essa
 * 
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Componenti figli che avranno accesso al contesto
 */
export function WishlistProvider({ children }) {
  // Accesso al contesto di autenticazione per ottenere i dati dell'utente
  const { isAuthenticated, user, token } = useContext(AuthContext);
  // Stato per memorizzare gli elementi nella wishlist dell'utente
  const [wishlist, setWishlist] = useState([]);
  // Stato per gestire lo stato di caricamento durante le operazioni asincrone
  const [loading, setLoading] = useState(false);
  // Stato per gestire eventuali errori durante le operazioni
  const [error, setError] = useState(null);
  /**
   * Recupera la wishlist dal server
   * Utilizza useCallback per evitare ricreazioni inutili della funzione
   * 
   * @returns {Promise<void>} - Promise che si risolve quando la wishlist è stata recuperata
   */
  const fetchWishlist = useCallback(async () => {
    // Se l'utente non è autenticato, resetta la wishlist e termina
    if (!isAuthenticated() || !token) {
      setWishlist([]);
      return;
    }
    
    // Attiva l'indicatore di caricamento e resetta eventuali errori precedenti
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        if (!response.ok) {
        throw new Error(`Impossibile recuperare la wishlist: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setWishlist(data.wishlist || []);
      } else {
        throw new Error(data.error || 'Impossibile recuperare la wishlist');
      }
    } catch (err) {
      setError(err.message);
      console.error('Errore nel recupero della wishlist:', err);
      setWishlist([]); // Resetta la wishlist in caso di errore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);
  /**
   * Carica la wishlist quando l'utente cambia o si autentica
   * Questo effect si attiva quando cambiano le dipendenze: isAuthenticated, token, fetchWishlist
   */
  useEffect(() => {
    // Se l'utente è autenticato, carica la wishlist dal server
    if (isAuthenticated() && token) {
      fetchWishlist();
    } else {
      // Altrimenti, resetta la wishlist a un array vuoto
      setWishlist([]);
    }
  }, [isAuthenticated, token, fetchWishlist]);
  /**
   * Aggiunge un prodotto alla wishlist 
   * Implementa un aggiornamento ottimistico dell'interfaccia e rollback in caso di errori
   * 
   * @param {Object} product - Il prodotto da aggiungere alla wishlist
   * @returns {Promise<boolean>} - Promise che si risolve a true se l'operazione ha successo
   */
  const addToWishlist = useCallback(async (product) => {    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) {
      return Promise.reject(new Error('Utente non autenticato'));
    }
    
    // Mantiene una copia della wishlist attuale per eventuale ripristino in caso di errore
    const previousWishlist = [...wishlist];
    
    // Aggiornamento ottimistico dell'interfaccia
    setWishlist(currentWishlist => {
      if (!currentWishlist.some(item => item.id === product.id)) {
        return [...currentWishlist, product];
      }
      return currentWishlist;
    });
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id
        })
      });
      
      if (!response.ok) {        throw new Error(`Richiesta fallita: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Impossibile aggiungere il prodotto alla wishlist');
      }
      
      return true; // Operazione completata con successo
    } catch (err) {
      // Ripristino dello stato precedente in caso di errore
      setWishlist(previousWishlist);
      setError(err.message);
      console.error('Errore durante l\'aggiunta alla wishlist:', err);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, wishlist]);
  /**
   * Rimuove un prodotto dalla wishlist
   * Implementa un aggiornamento ottimistico dell'interfaccia e rollback in caso di errori
   * 
   * @param {number|string} productId - L'ID del prodotto da rimuovere dalla wishlist
   * @returns {Promise<boolean>} - Promise che si risolve a true se l'operazione ha successo
   */
  const removeFromWishlist = useCallback(async (productId) => {    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) {
      return Promise.reject(new Error('Utente non autenticato'));
    }
    
    // Mantiene una copia della wishlist attuale per eventuale ripristino in caso di errore
    const previousWishlist = [...wishlist];
    // Trova l'elemento da rimuovere per verificare che esista
    const removedItem = wishlist.find(item => item.id === productId);
    
    if (!removedItem) {
      return Promise.reject(new Error('Prodotto non trovato nella wishlist'));
    }
      // Aggiornamento ottimistico dell'interfaccia
    setWishlist(currentWishlist => currentWishlist.filter(item => item.id !== productId));
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=wishlist`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId
        })
      });
      
      if (!response.ok) {        throw new Error(`Richiesta fallita: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Impossibile rimuovere il prodotto dalla wishlist');
      }
      
      return true; // Operazione completata con successo
    } catch (err) {
      // Ripristino dello stato precedente in caso di errore
      setWishlist(previousWishlist);
      setError(err.message);
      console.error('Errore durante la rimozione dalla wishlist:', err);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, wishlist]);
  /**
   * Verifica se un prodotto è presente nella wishlist
   * 
   * @param {number|string} productId - L'ID del prodotto da verificare
   * @returns {boolean} - true se il prodotto è nella wishlist, altrimenti false
   */
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => Number(item.id) === Number(productId));
  }, [wishlist]);
  /**
   * Memorizza il valore del contesto per evitare render non necessari
   * Utilizza useMemo per ricrearlo solo quando effettivamente cambiano le dipendenze
   */
  const contextValue = useMemo(() => ({
    wishlist,                         // Array di prodotti nella wishlist
    loading,                          // Stato di caricamento
    error,                            // Eventuali errori
    addToWishlist,                    // Funzione per aggiungere prodotti
    removeFromWishlist,               // Funzione per rimuovere prodotti
    isInWishlist,                     // Funzione per verificare la presenza di un prodotto
    refreshWishlist: fetchWishlist,   // Funzione per aggiornare manualmente la wishlist
    wishlistCount: wishlist.length    // Proprietà calcolata: numero di elementi nella wishlist
  }), [wishlist, loading, error, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist]);
  /**
   * Render del provider che fornisce il contesto a tutti i componenti figli
   */
  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}
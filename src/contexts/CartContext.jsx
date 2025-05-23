/**
 * CartContext.jsx: Contesto per la gestione del carrello acquisti.
 * Include recupero, aggiunta, aggiornamento, rimozione prodotti,
 * con UI ottimistica e rollback.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
// Importazione del contesto di autenticazione per verificare se l'utente è loggato
import { AuthContext } from './AuthContext';
// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../config/api';

/**
 * Contesto React per il carrello.
 */
export const CartContext = createContext();

/**
 * Provider per il contesto Carrello.
 * Gestisce stato e interazioni del carrello.
 * @param {Object} props Props del componente.
 * @param {React.ReactNode} props.children Componenti figli.
 */
export function CartProvider({ children }) {
  // Utilizzo del contesto di autenticazione per accedere alle informazioni sull'utente
  const { isAuthenticated, token } = useContext(AuthContext);
  
  // Stati per gestire i prodotti nel carrello, lo stato di caricamento e gli errori
  const [cart, setCart] = useState([]);       // Array di prodotti nel carrello
  const [loading, setLoading] = useState(false); // Stato di caricamento per operazioni asincrone
  const [error, setError] = useState(null);   // Eventuali errori durante le operazioni
    /**
   * Recupera i dati del carrello dal server.
   * @returns {Promise<void>} Promise al caricamento del carrello.
   */
  const fetchCart = useCallback(async () => {
    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) return;
    
    // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      // Effettua la richiesta API per ottenere il carrello
      const response = await fetch(`${API_BASE_URL}/api.php?path=cart`, {
        headers: {
          'Authorization': `Bearer ${token}` // Invia il token di autenticazione
        }
      });
      
      // Analizza la risposta JSON
      const data = await response.json();
      
      if (data.success) {
        // Aggiorna lo stato del carrello con i dati ricevuti
        setCart(data.cart || []);
      } else {
        // Lancia un errore se la risposta non ha avuto successo
        throw new Error(data.error || 'Impossibile caricare il carrello');
      }
    } catch (err) {
      // Gestisce gli errori impostando il messaggio di errore
      setError(err.message);
      console.error('Errore durante il caricamento del carrello:', err);
    } finally {
      // Reimposta lo stato di caricamento
      setLoading(false);
    }
  }, [isAuthenticated, token]);
  /**
   * Effect che ricarica il carrello quando lo stato di autenticazione cambia.
   */
  useEffect(() => {
    if (isAuthenticated() && token) {
      // Se l'utente è autenticato, carica il carrello dal server
      fetchCart();
    } else {
      // Se l'utente non è autenticato, svuota il carrello locale
      setCart([]);
    }
  }, [isAuthenticated, token, fetchCart]); // Dipendenze dell'effect
  
  /**
   * Aggiunge un prodotto al carrello o ne incrementa la quantità.
   * UI ottimistica con rollback.
   * @param {Object} product Prodotto da aggiungere.
   * @param {string} product.id ID univoco del prodotto.
   * @param {number} [product.quantity=1] Quantità del prodotto.
   * @returns {Promise<void>} Promise al completamento.
   */
  const addToCart = useCallback(async (product) => { 
    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) return;
    
    // Salva la versione corrente del carrello per il rollback in caso di errore
    const previousCart = [...cart];
    
    // Aggiornamento ottimistico dell'interfaccia (UI aggiornata prima della risposta del server)
    setCart(currentCart => {
      // Verifica se il prodotto è già presente nel carrello
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Se il prodotto è già nel carrello, aggiorna la quantità
        const updatedCart = [...currentCart];
        const quantity = product.quantity || 1;
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        return updatedCart;
      } else {
        // Se è un nuovo prodotto, aggiungilo con la quantità specificata o 1 se non specificata
        return [...currentCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
      // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      // Invia la richiesta al server per aggiungere il prodotto al carrello
      const response = await fetch(`${API_BASE_URL}/api.php?path=cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Specifica il tipo di contenuto JSON
          'Authorization': `Bearer ${token}`   // Invia il token di autenticazione
        },
        body: JSON.stringify({
          productId: product.id,               // ID del prodotto da aggiungere
          quantity: product.quantity || 1      // Quantità, default 1
        })
      });
      
      // Analizza la risposta JSON
      const data = await response.json();
      
      if (!data.success) {
        // Ripristina il carrello allo stato precedente in caso di errore
        setCart(previousCart);
        throw new Error(data.error || 'Impossibile aggiungere il prodotto al carrello');
      }
      
      // Aggiorna il carrello dal server per garantire la sincronizzazione
      fetchCart();
    } catch (err) {
      // Ripristina il carrello allo stato precedente e imposta l'errore
      setCart(previousCart);
      setError(err.message);
      console.error('Errore nell\'aggiunta al carrello:', err);
    } finally {
      // Reimposta lo stato di caricamento
      setLoading(false);
    }
  }, [isAuthenticated, token, cart, fetchCart]);  
  /**
   * Rimuove un prodotto dal carrello.
   * UI ottimistica con rollback.
   * @param {string} productId ID prodotto da rimuovere.
   * @returns {Promise<void>} Promise al completamento.
   */
  const removeFromCart = useCallback(async (productId) => {
    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) return;
    
    // Salva la versione corrente del carrello per il rollback in caso di errore
    const previousCart = [...cart];
    
    // Aggiornamento ottimistico dell'interfaccia (rimuove l'elemento dal carrello prima della risposta del server)
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
    
    // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        // Ripristina il carrello in caso di errore
        setCart(previousCart);
        throw new Error(data.error || 'Failed to remove item from cart');
      }
    } catch (err) {
      // Ripristina il carrello in caso di errore
      setCart(previousCart);
      setError(err.message);
      console.error('Error removing from cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, cart]);  
  /**
   * Aggiorna la quantità di un prodotto nel carrello.
   * Rimuove il prodotto se la quantità è <= 0.
   * @param {string} productId ID prodotto da aggiornare.
   * @param {number} quantity Nuova quantità.
   * @returns {Promise<void>} Promise al completamento.
   */
  const updateQuantity = useCallback(async (productId, quantity) => {
    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) return;
    
    // Se la quantità è 0 o negativa, usa la funzione removeFromCart per rimuovere il prodotto
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    // Salva la versione corrente del carrello per il rollback in caso di errore
    const previousCart = [...cart];
    
    // Aggiornamento ottimistico dell'interfaccia (aggiorna la quantità prima della risposta del server)
    setCart(currentCart => {
      return currentCart.map(item => {
        if (item.id === productId) {
          // Aggiorna solo il prodotto con l'ID specificato
          return { ...item, quantity };
        }
        return item;
      });
    });
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        // Ripristina il carrello in caso di errore
        setCart(previousCart);
        throw new Error(data.error || 'Failed to update quantity');
      }
    } catch (err) {
      // Ripristina il carrello in caso di errore
      setCart(previousCart);
      setError(err.message);
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, cart, removeFromCart]);  
  /**
   * Svuota completamente il carrello.
   * UI ottimistica con rollback.
   * @returns {Promise<void>} Promise al completamento.
   */
  const clearCart = useCallback(async () => {
    // Verifica che l'utente sia autenticato prima di procedere
    if (!isAuthenticated() || !token) return;
    
    // Salva la versione corrente del carrello per il rollback in caso di errore
    const previousCart = [...cart];
    
    // Aggiornamento ottimistico dell'interfaccia (svuota il carrello prima della risposta del server)
    setCart([]);
    
    // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?path=cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        // Ripristina il carrello in caso di errore
        setCart(previousCart);
        throw new Error(data.error || 'Failed to clear cart');
      }
    } catch (err) {
      // Ripristina il carrello in caso di errore
      setCart(previousCart);
      setError(err.message);
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, cart]);
  /**
   * Calcola il prezzo totale del carrello.
   * @returns {number} Prezzo totale.
   */
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);
  
  /**
   * Calcola il numero totale di articoli nel carrello.
   * @returns {number} Numero totale articoli.
   */
  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  /**
   * Valore memoizzato del contesto per ottimizzare le performance.
   */
  const contextValue = useMemo(() => ({ 
    cart,                  // Array dei prodotti nel carrello
    loading,               // Stato di caricamento per operazioni asincrone
    error,                 // Eventuali errori durante le operazioni
    addToCart,             // Funzione per aggiungere un prodotto
    removeFromCart,        // Funzione per rimuovere un prodotto
    updateQuantity,        // Funzione per aggiornare la quantità
    clearCart,             // Funzione per svuotare il carrello
    refreshCart: fetchCart, // Funzione per aggiornare manualmente il carrello
    cartTotal,             // Prezzo totale del carrello
    cartItemCount          // Numero totale di articoli nel carrello
  }), [
    cart, 
    loading, 
    error, 
    addToCart, 
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    cartTotal,
    cartItemCount
  ]);
  /**
   * Renderizza il provider del contesto.
   */
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * AuthContext.jsx: Contesto per la gestione dell'autenticazione.
 * Include login, logout, registrazione, gestione sessione e persistenza.
 */

// Importazione degli hook e delle utilità React necessarie
import { createContext, useState, useEffect, useMemo, useCallback } from 'react';

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../config/api';

/**
 * Contesto React per l'autenticazione.
 */
export const AuthContext = createContext();

/**
 * Provider per il contesto Autenticazione.
 * Gestisce stato utente, login, registrazione.
 * @param {Object} props Props del componente.
 * @param {React.ReactNode} props.children Componenti figli.
 */
export function AuthProvider({ children }) {
  /**
   * Inizializza lo stato utente dal localStorage
   * Recupera e verifica i dati utente salvati per mantenere la sessione tra i refresh
   */
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Errore durante il parsing dell\'utente da localStorage:', e);
      return null;
    }
  });
    // Stati per gestire il token di autenticazione, caricamento e errori
  const [token, setToken] = useState(() => localStorage.getItem('token')); // Token JWT per l'autenticazione
  const [loading, setLoading] = useState(false); // Stato di caricamento per operazioni asincrone
  const [error, setError] = useState(null);      // Eventuali errori durante le operazioni
  
  /**
   * Effect per salvare i dati utente in localStorage quando cambiano
   * Garantisce che le informazioni dell'utente persistano tra i refresh del browser
   */
  useEffect(() => {
    if (user) {
      // Salva i dati utente come stringa JSON
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      // Rimuove i dati utente quando l'utente non è più loggato
      localStorage.removeItem('user');
    }
  }, [user]); // Si attiva solo quando l'oggetto user cambia

  /**
   * Effect per salvare il token in localStorage quando cambia
   * Garantisce che il token di autenticazione persista tra i refresh del browser
   */
  useEffect(() => {
    if (token) {
      // Salva il token come stringa
      localStorage.setItem('token', token);
    } else {
      // Rimuove il token quando l'utente non è più loggato
      localStorage.removeItem('token');
    }  }, [token]); // Si attiva solo quando il token cambia
  
  /**
   * Funzione per effettuare il login dell'utente
   * Utilizza useCallback per evitare ricreazioni inutili della funzione
   * 
   * @param {string} email - L'email dell'utente
   * @param {string} password - La password dell'utente
   * @returns {Promise<Object>} Promise con i dati dell'utente in caso di successo
   */
  const login = useCallback(async (email, password) => {
    // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      // Chiamata API per autenticare l'utente
      const response = await fetch(`${API_BASE_URL}/api.php?path=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
        if (!response.ok) {
        throw new Error(`Login fallito: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Login fallito');
      }

      setUser(data.user);
      setToken(data.token);

      // Quando l'utente effettua il login, i contesti del carrello e della wishlist
      // si aggiorneranno automaticamente poiché osservano i cambiamenti del token
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  /**
   * Funzione per registrare un nuovo utente
   * Utilizza useCallback per evitare ricreazioni inutili della funzione
   * 
   * @param {string} name - Il nome dell'utente
   * @param {string} email - L'email dell'utente
   * @param {string} password - La password dell'utente
   * @param {boolean} with2fa - Flag per attivare l'autenticazione a due fattori
   * @returns {Promise<Object>} Promise con i dati dell'utente in caso di successo
   */
  const register = useCallback(async (name, email, password, with2fa = true) => {
    // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      // Chiamata API per registrare l'utente
      const response = await fetch(`${API_BASE_URL}/api.php?path=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, with2fa }),
      });
        if (!response.ok) {
        throw new Error(`Registrazione fallita: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Registrazione fallita');
      }

      return data; // Ritorna l'userId per il processo di autenticazione a due fattori
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  /**
   * Funzione per verificare il codice 2FA e completare il login
   * Utilizza useCallback per evitare ricreazioni inutili della funzione
   * 
   * @param {string|number} userId - L'ID dell'utente che sta verificando il codice 2FA
   * @param {string} code - Il codice di verifica 2FA inserito dall'utente
   * @returns {Promise<Object>} Promise con i dati dell'utente in caso di successo
   */
  const verifyAndLogin = useCallback(async (userId, code) => {
    // Imposta lo stato di caricamento e resetta gli errori
    setLoading(true);
    setError(null);
    
    try {
      // Chiamata API per verificare il codice 2FA
      const response = await fetch(`${API_BASE_URL}/api.php?path=verify2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, code }),
      });
        if (!response.ok) {
        throw new Error(`Verifica fallita: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Verifica fallita');
      }

      // Imposta l'utente e il token dopo la verifica riuscita
      setUser(data.user);
      setToken(data.token);
        
      // Quando il token cambia, i contesti del carrello e della wishlist si aggiorneranno automaticamente
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  /**
   * Funzione per effettuare il logout dell'utente
   * Cancella i dati utente, il token e rimuove le informazioni da localStorage
   * Utilizza useCallback per evitare ricreazioni inutili della funzione
   */
  const logout = useCallback(() => {
    // Cancella i dati utente dalla memoria
    setUser(null);
    setToken(null);
    
    // Cancella i dati da localStorage per assicurarsi che la sessione sia terminata
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Resetta lo stato di errore
    setError(null);
  }, []);
  /**
   * Funzione per verificare se l'utente è autenticato
   * Verifica la presenza sia del token che dei dati utente
   * 
   * @returns {boolean} true se l'utente è autenticato, altrimenti false
   */
  const isAuthenticated = useCallback(() => {
    return !!token && !!user; // Verifica che entrambi token e user siano definiti
  }, [token, user]);

  /**
   * Funzione per verificare se l'utente ha privilegi di amministratore
   * Controlla se il ruolo dell'utente è settato come 'admin'
   * 
   * @returns {boolean} true se l'utente è un amministratore, altrimenti false
   */
  const isAdmin = useCallback(() => {
    return user?.role === 'admin'; // Verifica se il ruolo è 'admin'
  }, [user]);
  /**
   * Memoizza il valore del contesto per evitare render non necessari
   * Comprende tutti i valori e le funzioni che saranno disponibili nel contesto
   */
  const contextValue = useMemo(() => ({ 
    user,                 // Dati dell'utente corrente
    loading,              // Stato di caricamento per operazioni asincrone
    error,                // Eventuali errori durante le operazioni
    login,                // Funzione per effettuare il login
    register,             // Funzione per registrare un nuovo utente
    logout,               // Funzione per effettuare il logout
    isAuthenticated,      // Funzione per verificare l'autenticazione
    isAdmin,              // Funzione per verificare i privilegi di amministratore
    token,                // Token JWT per l'autenticazione
    verifyAndLogin,       // Funzione per verificare il codice 2FA
    // Proprietà calcolate
    userName: user?.name || '',       // Nome dell'utente o stringa vuota
    userEmail: user?.email || '',     // Email dell'utente o stringa vuota
    userRole: user?.role || 'guest'   // Ruolo dell'utente o 'guest' di default
  }), [
    user, 
    loading, 
    error, 
    login, 
    register, 
    logout, 
    isAuthenticated, 
    isAdmin, 
    token, 
    verifyAndLogin
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
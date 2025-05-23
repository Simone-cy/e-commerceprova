/**
 * ProtectedRoute.jsx
 * 
 * Questo componente implementa un sistema di protezione delle rotte nell'applicazione.
 * Si occupa di verificare se l'utente è autenticato prima di consentire l'accesso
 * a determinate pagine o sezioni dell'app che richiedono autenticazione.
 * 
 * Funzionalità principali:
 * - Verifica lo stato di autenticazione dell'utente
 * - Reindirizza gli utenti non autenticati alla pagina di login
 * - Supporta restrizioni aggiuntive basate sul ruolo (es. solo admin)
 */

// Importazione degli hook React necessari
import { useContext } from 'react';
// Importazione del componente per la navigazione programmatica
import { Navigate } from 'react-router-dom';
// Importazione del contesto di autenticazione per accedere allo stato dell'utente
import { AuthContext } from '../../contexts/AuthContext';

/**
 * Componente wrapper per proteggere le route che richiedono autenticazione
 * 
 * Questo componente agisce da guardia per le rotte protette dell'applicazione.
 * Avvolge i componenti che devono essere visualizzati solo da utenti autenticati,
 * verificando lo stato di autenticazione e i permessi prima del rendering.
 * 
 * @param {Object} props - Le proprietà del componente
 * @param {React.ReactNode} props.children - I componenti figli da renderizzare se l'autenticazione ha successo
 * @param {boolean} props.adminOnly - Flag per limitare l'accesso ai soli amministratori
 * @returns {JSX.Element} Il componente figlio o un reindirizzamento
 */
function ProtectedRoute({ children, adminOnly = false }) {
  // Accesso alle funzioni e dati di autenticazione dal contesto globale
  const { isAuthenticated, user } = useContext(AuthContext);
  
  // Se l'utente non è autenticato, reindirizza immediatamente alla pagina di login
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
    /**
   * Verifica dei permessi di amministrazione
   * 
   * Se la rotta richiede privilegi di amministratore, verifica
   * che l'utente abbia il ruolo appropriato. In caso contrario,
   * reindirizza l'utente alla pagina principale.
   */
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  /**
   * Rendering del contenuto protetto
   * 
   * A questo punto tutte le verifiche di sicurezza sono state superate:
   * - L'utente è autenticato
   * - Se necessario, l'utente ha i permessi di amministratore
   * Di conseguenza, possiamo renderizzare il contenuto protetto
   */
  return children;
}

export default ProtectedRoute;
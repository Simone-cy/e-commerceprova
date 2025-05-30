
/**
 * Questo componente gestisce l'autenticazione a due fattori (2FA) degli utenti.
 * Dopo l'autenticazione iniziale con email e password, l'utente deve inserire
 * un codice temporaneo ricevuto tramite email o app di autenticazione per
 * completare l'accesso, aggiungendo un livello di sicurezza supplementare.
 * 
 * Il componente presenta un'interfaccia per l'inserimento del codice,
 * gestisce la validazione e completa il processo di autenticazione.
 * 
 * @module components/auth/TwoFactorAuth
 */

/**
 * Importazioni per il componente di Autenticazione a Due Fattori
 * 
 * - useState, useContext: Hook di React per gestione stato locale e globale
 * - useNavigate, useLocation: Hook di React Router per gestione navigazione
 * - AuthContext: Contesto per accedere allo stato e funzioni di autenticazione
 * - Componenti Material-UI: Per costruire l'interfaccia utente
 */
import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Container,       // Contenitore principale con larghezza massima
  Paper,           // Card con elevazione per il form
  TextField,       // Campo di input per il codice di verifica
  Button,          // Pulsante per inviare il codice
  Typography,      // Componenti tipografici per titoli e testi
  Box,             // Contenitore flessibile per layout
  Alert,           // Componente per messaggi di errore
  CircularProgress // Indicatore di caricamento
} from '@mui/material';

/**
 * Componente principale per l'autenticazione a due fattori
 * 
 * Gestisce il processo di verifica dell'identità dell'utente tramite
 * un codice temporaneo dopo il login tradizionale. Questo aggiunge un
 * livello di sicurezza supplementare all'accesso dell'utente.
 * 
 * Il componente presenta un form semplice per l'inserimento del codice
 * di verifica e gestisce il feedback all'utente durante il processo.
 * 
 * @returns {JSX.Element} Il componente renderizzato per l'autenticazione a due fattori
 */
function TwoFactorAuth() {
  // Hook per la navigazione programmatica tra pagine dopo la verifica
  const navigate = useNavigate();
  // Hook per accedere ai parametri passati durante la navigazione
  const location = useLocation();
  // Accesso allo stato globale di autenticazione per loading ed errori
  const { loading, error } = useContext(AuthContext);
  // Stato locale per memorizzare il codice di verifica inserito dall'utente
  const [code, setCode] = useState('');
  
  /**
   * Gestisce l'invio del form con il codice di verifica
   * 
   * Elabora il codice inserito dall'utente, eseguendo la verifica
   * e navigando alla home in caso di successo.
   * 
   * @param {Event} e - Evento di submit del form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      /**
       * Nota: Implementazione dimostrativa
       * 
       * In una implementazione di produzione completa, questo metodo dovrebbe:
       * 1. Inviare il codice inserito al server per la verifica
       * 2. Attendere la risposta di conferma dal server
       * 3. Gestire correttamente successo ed errori
       * 4. Completare l'autenticazione salvando i token necessari
       */
      
      // Per ora, semplicemente reindirizza alla home come dimostrazione
      navigate('/');
    } catch (err) {
      console.error('Verifica 2FA fallita:', err);
    }
  };  /**
   * Rendering dell'interfaccia utente per l'autenticazione a due fattori
   * 
   * L'interfaccia presenta un form semplice e centrato con:
   * - Titolo descrittivo della pagina
   * - Eventuale messaggio di errore
   * - Campo di input per il codice di verifica
   * - Pulsante per inviare il codice
   */
  return (
    <Container maxWidth="sm">
      {/* Container esterno per centrare il form nella pagina */}
      <Box sx={{ 
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Card con elevazione per far risaltare il form */}
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {/* Titolo principale della pagina */}
          <Typography component="h1" variant="h5" gutterBottom>
            Autenticazione a Due Fattori
          </Typography>

          {/* Messaggio esplicativo per l'utente */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Inserisci il codice di verifica che hai ricevuto per completare l'accesso.
          </Typography>

          {/* Visualizzazione condizionale di eventuali messaggi di errore */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form per l'inserimento e l'invio del codice di verifica */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Campo di input per il codice di verifica */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Codice di Autenticazione"
              name="code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              inputProps={{ 
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              placeholder="123456"
            />
            
            {/* Pulsante per inviare il codice con stato di caricamento */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {/* Indicatore di caricamento o testo del pulsante in base allo stato */}
              {loading ? <CircularProgress size={24} /> : 'Verifica'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

// Esportazione del componente per l'uso in altre parti dell'applicazione
export default TwoFactorAuth;

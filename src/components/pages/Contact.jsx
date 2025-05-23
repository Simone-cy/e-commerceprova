/**
 * Contact.jsx
 * 
 * Questo file implementa la pagina di contatto dell'applicazione e-commerce.
 * Fornisce un'interfaccia per gli utenti per inviare messaggi, richieste di 
 * assistenza o domande all'azienda. Include validazione dei form, feedback
 * visivo e gestione dell'invio dei messaggi al server.
 * 
 * La pagina contiene:
 * - Un modulo di contatto con vari campi (nome, email, oggetto, messaggio)
 * - Informazioni di contatto dell'azienda (telefono, email, indirizzo)
 * - Mappa per la posizione fisica del negozio
 * - Feedback visivi durante e dopo l'invio del messaggio
 */

// Importazione degli hook React necessari per la gestione dello stato e degli effetti
import { useState, useCallback, useContext, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importazione dei componenti Material-UI per l'interfaccia utente
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
// Importazione delle icone Material-UI
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationIcon,
  Send as SendIcon
} from '@mui/icons-material';
// Importazione del contesto di autenticazione
import { AuthContext } from '../../contexts/AuthContext';

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// URL per la pagina di contatto
const CONTACT_API_URL = `${API_BASE_URL}/api.php?path=contact`;

// Array di tipi di problemi selezionabili nel form
const issueTypes = [
  { value: 'order', label: 'Order Issue' },
  { value: 'product', label: 'Product Information' },
  { value: 'account', label: 'Account Problem' },
  { value: 'payment', label: 'Payment Issue' },
  { value: 'website', label: 'Website Error' },
  { value: 'other', label: 'Other' }
];

// Componente memo per visualizzare le informazioni di contatto
// Memorizzato per evitare re-render non necessari
const ContactInfo = memo(() => (
  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: 'primary.main' }}>
      Contact Information
    </Typography>
    <Divider sx={{ mb: 3 }} />
    
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <EmailIcon color="primary" sx={{ mr: 2 }} />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Email</Typography>
        <Typography variant="body2" color="text.secondary">support@e-store.com</Typography>
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <PhoneIcon color="primary" sx={{ mr: 2 }} />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Phone</Typography>
        <Typography variant="body2" color="text.secondary">+39 000 000 0000</Typography>
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <LocationIcon color="primary" sx={{ mr: 2 }} />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Address</Typography>
        <Typography variant="body2" color="text.secondary">
          123 E-Commerce Street<br />
          Tech City, TC 12345
        </Typography>
      </Box>
    </Box>
    
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Business Hours</Typography>
      <Typography variant="body2">Monday - Friday: 9:00 AM - 6:00 PM</Typography>
      <Typography variant="body2">Saturday: 10:00 AM - 4:00 PM</Typography>
      <Typography variant="body2">Sunday: Closed</Typography>
    </Box>
  </Paper>
));

// Componente principale della pagina di contatto
function Contact() {
  // Hook per la navigazione tra le pagine
  const navigate = useNavigate();
  // Accesso al contesto di autenticazione per ottenere dati utente
  const { user, isAuthenticated } = useContext(AuthContext);
  
  // Effect per reindirizzare l'utente se non è autenticato
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
    // Stato del form - contiene tutti i dati inseriti dall'utente
  const [formData, setFormData] = useState({
    name: user?.name || '',        // Nome precompilato con dati utente se disponibili
    email: user?.email || '',      // Email precompilata con dati utente se disponibili
    issueType: '',                 // Tipo di problema selezionato
    orderNumber: '',               // Numero d'ordine (opzionale)
    subject: '',                   // Oggetto del messaggio
    message: ''                    // Contenuto del messaggio
  });
  
  // Stati UI per gestire il caricamento e le notifiche
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,                  // Stato di apertura della notifica
    message: '',                  // Messaggio della notifica
    severity: 'success'           // Tipo di notifica (success, error, info, warning)
  });

  // Stato per la gestione degli errori di validazione del form
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    issueType: false,
    subject: false,
    message: false
  });
  // Funzione per gestire i cambiamenti nei campi del form
  // Utilizza useCallback per memorizzare la funzione e evitare re-render inutili
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Aggiorna lo stato del form con il nuovo valore
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Cancella l'errore quando il campo viene modificato
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  }, [formErrors]);
  // Funzione per validare i dati del form prima dell'invio
  // Ritorna true se il form è valido, false altrimenti
  const validateForm = useCallback(() => {
    const errors = {
      name: !formData.name.trim(),                                                        // Nome non può essere vuoto
      email: !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email), // Email valida richiesta
      issueType: !formData.issueType,                                                     // Tipo problema richiesto
      subject: !formData.subject.trim(),                                                  // Oggetto richiesto
      message: !formData.message.trim() || formData.message.length < 10                   // Messaggio min 10 caratteri
    };
    
    // Imposta gli errori nello stato per mostrare feedback all'utente
    setFormErrors(errors);
    
    // Ritorna true se non ci sono errori, false altrimenti
    return !Object.values(errors).some(Boolean);
  }, [formData]);
  // Gestore per l'invio del form di contatto
  // Utilizza useCallback per memorizzare la funzione ed evitare re-render inutili
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Valida il form prima dell'invio e mostra un messaggio di errore se non valido
    if (!validateForm()) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields correctly.',
        severity: 'error'
      });
      return;
    }
    
    // Attiva lo stato di caricamento
    setLoading(true);
    
    try {      // Simulazione di chiamata API
      // In un'applicazione reale, chiameresti la tua API qui
      // const response = await fetch(CONTACT_API_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulazione di una risposta con ritardo di 1.5 secondi
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reimpostazione del form dopo l'invio con successo
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        issueType: '',
        orderNumber: '',
        subject: '',
        message: ''
      });
      
      // Mostra notifica di successo
      setNotification({
        open: true,
        message: 'Your message has been sent successfully! We will contact you soon.',
        severity: 'success'
      });
    } catch (error) {
      // Gestione degli errori
      console.error('Error sending contact form:', error);
      setNotification({
        open: true,
        message: 'An error occurred. Please try again later.',
        severity: 'error'
      });
    } finally {
      // Disattiva lo stato di caricamento indipendentemente dal risultato
      setLoading(false);
    }
  }, [formData, validateForm, user?.email, user?.name]);
  // Funzione per chiudere la notifica
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Se l'utente non è autenticato, non renderizza nulla
  // Il reindirizzamento alla pagina di login viene gestito dall'useEffect
  if (!isAuthenticated()) {
    return null;
  }
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Intestazione della pagina */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Need help with your order or have questions about our products? Our customer service team is here to help you.
        </Typography>
      </Box>      <Grid container spacing={4}>
        {/* Form di contatto - occupa i 2/3 della larghezza su desktop */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', mb: 3 }}>
              Send Us a Message
            </Typography>
            
            {/* Form per l'invio del messaggio */}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>                {/* Campo nome */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={formErrors.name}
                    helperText={formErrors.name ? 'Name is required' : ''}
                    disabled={loading}
                  />
                </Grid>                {/* Campo email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={formErrors.email}
                    helperText={formErrors.email ? 'Valid email is required' : ''}
                    disabled={loading}
                  />
                </Grid>
                {/* Campo per il tipo di problema */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Issue Type"
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={formErrors.issueType}
                    helperText={formErrors.issueType ? 'Please select an issue type' : ''}
                    disabled={loading}
                  >
                    {issueTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>                    ))}
                  </TextField>
                </Grid>
                {/* Campo per il numero d'ordine (opzionale) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Order Number (optional)"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={loading}
                  />
                </Grid>
                {/* Campo per l'oggetto del messaggio */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    error={formErrors.subject}
                    helperText={formErrors.subject ? 'Subject is required' : ''}
                    disabled={loading}
                  />                </Grid>
                {/* Campo per il messaggio (area di testo multilinea) */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    variant="outlined"
                    required
                    error={formErrors.message}
                    helperText={formErrors.message ? 'Message must be at least 10 characters' : ''}
                    disabled={loading}
                  />
                </Grid>
                {/* Pulsante di invio del messaggio con indicatore di caricamento */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{ px: 4 }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
          {/* Informazioni di contatto - occupa 1/3 della larghezza su desktop */}
        <Grid item xs={12} md={4}>
          <ContactInfo />
        </Grid>
      </Grid>
      
      {/* Sezione FAQ - Domande frequenti */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Frequently Asked Questions
        </Typography>      {/* Griglia per organizzare le FAQ in due colonne */}
      <Grid container spacing={3}>
          {/* Prima FAQ - Tracciamento ordini */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>How can I track my order?</Typography>
              <Typography variant="body2">
                You can track your order by logging into your account and visiting the order history section. 
                You will find tracking information once your order has been shipped.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Seconda FAQ - Politica di reso */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>What is your return policy?</Typography>
              <Typography variant="body2">
                We accept returns within 30 days of delivery. Items must be in original condition 
                with all tags and packaging intact.
              </Typography>
            </Paper>
          </Grid>
            {/* Terza FAQ - Tempi di spedizione */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>How long does shipping take?</Typography>
              <Typography variant="body2">
                Standard shipping typically takes 3-5 business days. Express shipping options 
                are available at checkout for faster delivery.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Quarta FAQ - Spedizioni internazionali */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Do you ship internationally?</Typography>
              <Typography variant="body2">
                Yes, we ship to most international locations. Shipping costs and delivery times 
                vary by destination. Please check the shipping information at checkout.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
        {/* Sistema di notifiche per mostrare feedback all'utente (successo/errore) */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Esporta il componente Contact memorizzato per evitare re-render non necessari
export default memo(Contact);

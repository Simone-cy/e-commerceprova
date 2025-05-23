/**
 * Componente Checkout
 * 
 * Implementa il processo di checkout multi-step per finalizzare gli acquisti nell'e-commerce.
 * Il processo è diviso in tre fasi principali:
 * 1. Inserimento dei dati di spedizione
 * 2. Inserimento dei dettagli di pagamento
 * 3. Conferma dell'ordine
 * 
 * Il componente utilizza uno stepper visuale per guidare l'utente attraverso
 * le diverse fasi del processo di acquisto.
 * 
 * @module components/pages/Checkout
 */

// Importazione degli hook di React per la gestione dello stato e del contesto
import { useState, useContext } from 'react';
// Importazione del hook di navigazione per reindirizzamenti dopo il completamento
import { useNavigate } from 'react-router-dom';
// Importazione del contesto del carrello per accedere agli articoli e al totale
import { CartContext } from '../../contexts/CartContext';
// Importazione dei componenti Material-UI per l'interfaccia utente del checkout
import {
  Container,    // Contenitore principale con larghezza massima
  Paper,        // Card con elevazione per il form di checkout
  Typography,   // Componenti tipografici per titoli e testi
  TextField,    // Campi di input per i dati dell'utente
  Button,       // Pulsanti per navigazione e invio
  Grid,         // Sistema a griglia per layout responsivo
  Box,          // Contenitore flessibile per layout
  Stepper,      // Componente per visualizzare i passaggi del processo
  Step,         // Singolo step all'interno dello stepper
  StepLabel,    // Etichetta per ogni step
  CircularProgress, // Indicatore di caricamento circolare
  Alert         // Componente per mostrare messaggi di errore
} from '@mui/material';

/**
 * Componente principale della pagina di checkout
 * 
 * Gestisce l'intero processo di finalizzazione dell'ordine attraverso
 * un'interfaccia multi-step che guida l'utente nella compilazione
 * dei dati necessari per completare l'acquisto.
 * 
 * @returns {JSX.Element} Il componente della pagina di checkout renderizzato
 */
function Checkout() {
  // Hook per la navigazione programmatica tra le pagine dell'applicazione
  const navigate = useNavigate();
  // Accesso ai dati del carrello e alla funzione per svuotarlo dopo l'acquisto
  const { cart, clearCart } = useContext(CartContext);
  
  /**
   * Gestione dello stato attivo nel processo multi-step
   * 
   * Lo step attivo determina quale parte del form viene visualizzata:
   * - 0: Dati di spedizione
   * - 1: Dati di pagamento
   * - 2: Conferma dell'ordine
   */
  const [activeStep, setActiveStep] = useState(0);
  
  /**
   * Stati per gestire l'interfaccia durante l'elaborazione dell'ordine
   * 
   * - loading: indica se è in corso un'operazione asincrona (es. invio dell'ordine)
   * - error: contiene eventuali messaggi di errore da mostrare all'utente
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Stato centrale per tutti i dati del form di checkout
   * 
   * Contiene tutti i campi necessari per completare l'ordine,
   * suddivisi logicamente tra informazioni di spedizione e di pagamento
   */
  const [formData, setFormData] = useState({
    // Dati personali e di spedizione (primo step)
    firstName: '',      // Nome dell'acquirente
    lastName: '',       // Cognome dell'acquirente
    email: '',          // Email per conferme e comunicazioni
    address: '',        // Indirizzo completo di spedizione
    city: '',           // Città di destinazione
    zipCode: '',        // Codice postale/CAP
    
    // Dati di pagamento (secondo step)
    cardNumber: '',     // Numero della carta di credito
    cardExpiry: '',     // Data di scadenza nel formato MM/AA
    cardCVC: ''         // Codice di sicurezza a 3 cifre
  });

  /**
   * Definizione dei passaggi del processo di checkout
   * 
   * Questi titoli vengono visualizzati nello stepper per orientare l'utente
   * attraverso il flusso di completamento dell'ordine
   */
  const steps = ['Dati di Spedizione', 'Informazioni di Pagamento', 'Conferma Ordine'];  /**
   * Gestisce i cambiamenti nei campi di input del form
   * 
   * Aggiorna lo stato del formData mantenendo gli altri campi inalterati
   * 
   * @param {Object} e - Evento di cambiamento del campo di input
   * @param {string} e.target.name - Nome del campo da aggiornare
   * @param {string} e.target.value - Nuovo valore del campo
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Avanza al prossimo step del processo di checkout
   * 
   * Incrementa l'indice dello step attivo per mostrare la schermata successiva
   */
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  /**
   * Torna allo step precedente del processo di checkout
   * 
   * Decrementa l'indice dello step attivo per tornare alla schermata precedente
   */
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  /**
   * Gestisce l'invio del form e il completamento dell'ordine
   * 
   * Processa il pagamento (simulato), gestisce gli stati di caricamento ed errori,
   * e avanza allo step finale in caso di successo
   * 
   * @param {Object} e - Evento di submit del form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulazione di una chiamata API per il processamento del pagamento
      // In una implementazione reale, questo invierebbe i dati al server
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attesa simulata
      
      // Svuota il carrello dopo che l'ordine è stato elaborato con successo
      clearCart();
      // Passa allo step finale (conferma)
      handleNext();
    } catch (err) {
      // Gestione degli errori durante il processo di pagamento
      setError('Impossibile processare il pagamento. Riprova più tardi.');
    } finally {
      // Ripristina lo stato di caricamento indipendentemente dal risultato
      setLoading(false);
    }
  };

  /**
   * Calcolo dell'importo totale dell'ordine
   * 
   * Somma i prezzi di tutti gli articoli nel carrello moltiplicati per le loro quantità
   */
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Card Number"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Expiry Date"
                name="cardExpiry"
                placeholder="MM/YY"
                value={formData.cardExpiry}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="CVC"
                name="cardCVC"
                value={formData.cardCVC}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Order Confirmed!
            </Typography>
            <Typography variant="body1">
              Thank you for your purchase. Your order has been received.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mt: 3 }}
            >
              Return to Home
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {activeStep !== 2 && (
              <>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Total: ${totalAmount.toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 
                      activeStep === steps.length - 2 ? 'Place Order' : 'Next'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default Checkout;
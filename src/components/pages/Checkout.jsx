/**
 * Checkout.jsx: Pagina di checkout per finalizzare l'acquisto.
 * Guida l'utente attraverso i passaggi di spedizione e pagamento.
 */

// Importazione degli hook e delle utilità React necessarie
import { useState, useContext, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { API_BASE_URL } from '../../config/api';

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
 * Passi del processo di checkout.
 */
const steps = ['Indirizzo di Spedizione', 'Dettagli di Pagamento', 'Riepilogo Ordine'];

/**
 * Componente per il form dell'indirizzo di spedizione.
 * @param {Object} props Props del componente.
 * @param {Object} props.formData Dati del form.
 * @param {Function} props.handleChange Gestore modifiche input.
 * @param {Object} props.errors Errori di validazione.
 */
const ShippingForm = memo(({ formData, handleChange, errors }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Nome"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Cognome"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
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
          error={!!errors.email}
          helperText={errors.email}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Indirizzo"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Città"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={!!errors.city}
          helperText={errors.city}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="CAP"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          error={!!errors.zipCode}
          helperText={errors.zipCode}
        />
      </Grid>
    </Grid>
  );
});
ShippingForm.displayName = 'ShippingForm';

/**
 * Componente per il form dei dettagli di pagamento.
 * @param {Object} props Props del componente.
 * @param {Object} props.formData Dati del form.
 * @param {Function} props.handleChange Gestore modifiche input.
 * @param {Object} props.errors Errori di validazione.
 */
const PaymentForm = memo(({ formData, handleChange, errors }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Numero Carta di Credito"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          error={!!errors.cardNumber}
          helperText={errors.cardNumber}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Data di Scadenza"
          name="cardExpiry"
          placeholder="MM/AA"
          value={formData.cardExpiry}
          onChange={handleChange}
          error={!!errors.cardExpiry}
          helperText={errors.cardExpiry}
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
          error={!!errors.cardCVC}
          helperText={errors.cardCVC}
        />
      </Grid>
    </Grid>
  );
});
PaymentForm.displayName = 'PaymentForm';

/**
 * Componente per il riepilogo dell'ordine.
 * @param {Object} props Props del componente.
 * @param {Object} props.formData Dati del form (indirizzo, pagamento).
 * @param {Array} props.cart Prodotti nel carrello.
 * @param {number} props.cartTotal Totale carrello.
 */
const OrderSummary = memo(({ formData, cart, cartTotal }) => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Riepilogo Ordine
      </Typography>
      <Typography variant="body1" gutterBottom>
        Indirizzo di Spedizione:
      </Typography>
      <Typography variant="body2" gutterBottom>
        {formData.firstName} {formData.lastName}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {formData.address}, {formData.zipCode} {formData.city}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ mt: 3 }}>
        Dettagli di Pagamento:
      </Typography>
      <Typography variant="body2" gutterBottom>
        Carta: **** **** **** {formData.cardNumber.slice(-4)}
      </Typography>
      <Typography variant="body2" gutterBottom>
        Scadenza: {formData.cardExpiry}
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Totale: €{cartTotal.toFixed(2)}
      </Typography>
    </Box>
  );
});
OrderSummary.displayName = 'OrderSummary';

/**
 * Componente principale della pagina di checkout.
 * Gestisce il processo multi-step per finalizzare l'ordine.
 */
function Checkout() {
  // Contesti per autenticazione e carrello
  const { isAuthenticated, user, token } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);
  
  // Definizione della navigazione
  const navigate = useNavigate();

  /**
   * Gestione dello stato attivo nel processo multi-step
   * 
   * Lo step attivo determina quale parte del form viene visualizzata:
   * - 0: Dati di spedizione
   * - 1: Dati di pagamento
   * - 2: Conferma dell'ordine
   */
  const [activeStep, setActiveStep] = useState(0);
  // Stato per i dati del form, inizializzati con i dati utente se disponibili
  const [formData, setFormData] = useState({
    // Dati personali e di spedizione (primo step)
    firstName: user?.firstName || '',      // Nome dell'acquirente
    lastName: user?.lastName || '',       // Cognome dell'acquirente
    email: user?.email || '',          // Email per conferme e comunicazioni
    address: '',        // Indirizzo completo di spedizione
    city: '',           // Città di destinazione
    zipCode: '',        // Codice postale/CAP
    
    // Dati di pagamento (secondo step)
    cardNumber: '',     // Numero della carta di credito
    cardExpiry: '',     // Data di scadenza nel formato MM/AA
    cardCVC: ''         // Codice di sicurezza a 3 cifre
  });
  /**
   * Stati per gestire l'interfaccia durante l'elaborazione dell'ordine
   * 
   * - loading: indica se è in corso un'operazione asincrona (es. invio dell'ordine)
   * - error: contiene eventuali messaggi di errore da mostrare all'utente
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Stato per gestire gli errori di validazione
  const [errors, setErrors] = useState({});

  /**
   * Definizione dei passaggi del processo di checkout.
   * Ogni elemento dell'array rappresenta un passo e contiene:
   * - label: Etichetta visualizzata nello stepper.
   * - component: Componente React da renderizzare per quel passo.
   * - fields: Array di stringhe che elenca i campi del form validati in quel passo.
   */
  const checkoutSteps = useMemo(() => [
    {
      label: 'Indirizzo di Spedizione',
      component: ShippingForm,
      fields: ['firstName', 'lastName', 'email', 'address', 'city', 'zipCode']
    },
    {
      label: 'Dettagli di Pagamento',
      component: PaymentForm,
      fields: ['cardNumber', 'cardExpiry', 'cardCVC']
    },
    {
      label: 'Riepilogo Ordine',
      component: OrderSummary,
      fields: []
    }
  ], []);

  /**
   * Calcolo del totale del carrello.
   * Utilizza useMemo per ottimizzare le performance evitando ricalcoli inutili.
   */
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  /**
   * Effetto per inizializzare/aggiornare i dati del form quando l'utente cambia.
   */
  useEffect(() => {
    if (isAuthenticated() && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        cardNumber: '',
        cardExpiry: '',
        cardCVC: ''
      });
    }
  }, [user, isAuthenticated]);

  /**
   * Gestisce la validazione dei campi del form per il passo corrente.
   * @returns {boolean} True se i campi sono validi, altrimenti false.
   */
  const validateStep = useCallback(() => {
    const { fields } = checkoutSteps[activeStep];
    let isValid = true;
    const newErrors = {};

    fields.forEach(field => {
      if (!formData[field]) {
        isValid = false;
        newErrors[field] = 'Questo campo è obbligatorio';
      }
    });

    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));

    return isValid;
  }, [activeStep, formData, checkoutSteps]);

  /**
   * Gestisce il passaggio allo step successivo.
   * Valida il form prima di procedere.
   */
  const handleNext = useCallback(() => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  }, [activeStep, steps.length, validateStep]);

  /**
   * Gestisce il ritorno allo step precedente.
   */
  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);

  /**
   * Gestisce le modifiche ai campi del form.
   * @param {React.ChangeEvent<HTMLInputElement>} e Evento di modifica.
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Invia l'ordine al server.
   * Chiamato all'ultimo step del checkout.
   */
  const handleSubmitOrder = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulazione di una chiamata API per il processamento del pagamento
      // In una implementazione reale, questo invierebbe i dati al server
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attesa simulata
      
      // Svuota il carrello dopo che l'ordine è stato elaborato con successo
      clearCart();
      // Reindirizza alla pagina principale o a una pagina di conferma
      navigate('/');
    } catch (err) {
      // Gestione degli errori durante il processo di pagamento
      setError('Impossibile processare il pagamento. Riprova più tardi.');
    } finally {
      // Ripristina lo stato di caricamento indipendentemente dal risultato
      setLoading(false);
    }
  }, [formData, cart, cartTotal, token, clearCart, navigate]);

  // Se il carrello è vuoto e non siamo alla conferma d'ordine, reindirizza
  if (cart.length === 0 && activeStep < steps.length) {
    navigate('/');
  }

  // Se l'utente non è autenticato, mostra un messaggio per effettuare il login
  if (!isAuthenticated()) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Accesso Richiesto
          </Typography>
          <Typography variant="body1" gutterBottom>
            Per procedere con il checkout, è necessario effettuare il login.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Accedi
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Render del componente Checkout
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {checkoutSteps.map(({ label }) => (
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

        <form onSubmit={handleSubmitOrder}>
          {checkoutSteps[activeStep].component === OrderSummary ? (
            <OrderSummary formData={formData} cart={cart} cartTotal={totalAmount} />
          ) : (
            (() => {
              const StepComponent = checkoutSteps[activeStep].component;
              return (
                <StepComponent
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
              );
            })()
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {activeStep !== 2 && (
              <>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Indietro
                </Button>
                <Button
                  variant="contained"
                  onClick={activeStep === steps.length - 2 ? handleSubmitOrder : handleNext}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 
                    activeStep === steps.length - 2 ? 'Completa Ordine' : 'Avanti'}
                </Button>
              </>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default memo(Checkout);

/**
 * Register.jsx
 * 
 * Questo file implementa la pagina di registrazione dell'applicazione e-commerce.
 * Gestisce un processo di registrazione in due fasi:
 * 1. Inserimento delle informazioni dell'account (nome, email, password)
 * 2. Verifica tramite codice OTP per l'autenticazione a due fattori
 * Include anche validazione dei dati, feedback visivo e gestione degli errori.
 */

// Importazione degli hook React necessari
import { useState, useContext } from 'react';
// Importazione dei componenti di navigazione per i reindirizzamenti
import { Link, useNavigate } from 'react-router-dom';
// Importazione del contesto di autenticazione per registrazione e verifica
import { AuthContext } from '../../contexts/AuthContext';
// Importazione dei componenti Material-UI
import {
  Container, Box, Typography, TextField, Button, Paper,
  CircularProgress, Alert, IconButton, InputAdornment,
  Stepper, Step, StepLabel
} from '@mui/material';
// Importazione delle icone per mostrare/nascondere password
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Componente principale per la pagina di registrazione
 * Gestisce l'interfaccia utente del processo di registrazione in più fasi e la logica associata
 */
function Register() {
  // Hook per la navigazione programmatica verso altre pagine dopo la registrazione
  const navigate = useNavigate();
  // Accesso alle funzioni di autenticazione dal contesto globale
  const { register, verifyAndLogin, loading, error } = useContext(AuthContext);
  
  /**
   * Stati locali per gestire il processo di registrazione
   */
  // Controllo visibilità della password durante l'inserimento
  const [showPassword, setShowPassword] = useState(false);
  // Errori di validazione del form per feedback immediato all'utente
  const [validationErrors, setValidationErrors] = useState({});
  // Step corrente nel processo di registrazione multifase
  const [activeStep, setActiveStep] = useState(0);
  // Codice di verifica OTP inserito dall'utente nella seconda fase
  const [verificationCode, setVerificationCode] = useState('');
  // ID dell'utente restituito dalla prima fase di registrazione
  const [userId, setUserId] = useState(null);
  // Email dell'utente memorizzata per messaggi informativi
  const [registrationEmail, setRegistrationEmail] = useState('');
  // Password memorizzata per effettuare il login automatico dopo la verifica
  const [password, setPassword] = useState('');
  
  /**
   * Definizione delle fasi del processo di registrazione
   * Utilizzate nello stepper per mostrare il progresso
   */
  const steps = ['Informazioni Account', 'Codice di Verifica'];
    /**
   * Stato per i dati del form di registrazione
   * Contiene tutti i campi necessari per registrare un nuovo account
   */
  const [formData, setFormData] = useState({
    name: '',             // Nome completo dell'utente
    email: '',            // Indirizzo email (usato come identificativo)
    password: '',         // Password dell'account
    confirmPassword: ''   // Conferma password per validazione
  });

  /**
   * Validazione dei dati del form di registrazione
   * Controlla completezza e correttezza dei dati inseriti
   * 
   * @returns {Object} Oggetto contenente eventuali errori di validazione
   */  const validateForm = () => {
    const errors = {};
    // Verifica che il nome sia stato inserito
    if (!formData.name.trim()) {
      errors.name = 'Il nome è obbligatorio';
    }
    // Verifica che l'email sia stata inserita e sia in formato valido
    if (!formData.email.trim()) {
      errors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Formato email non valido';
    }
    // Verifica che la password sia stata inserita e rispetti i requisiti minimi
    if (!formData.password) {
      errors.password = 'La password è obbligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La password deve contenere almeno 6 caratteri';
    }
    // Verifica che le password coincidano
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Le password non coincidono';
    }
    return errors;
  };
  /**
   * Gestisce i cambiamenti nei campi del form
   * Aggiorna lo stato del form in base all'input dell'utente
   * 
   * @param {Object} e - Evento di cambio input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Pulisci i messaggi di errore quando l'utente modifica un campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  /**
   * Gestisce l'invio del primo step del form di registrazione
   * Valida i dati inseriti e avvia il processo di registrazione
   * 
   * @param {Object} e - Evento di submit del form
   */
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    
    // Verifica che tutti i campi siano validi prima di procedere
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      // Prima fase: registrazione utente e invio codice via email
      const result = await register(formData.name, formData.email, formData.password, true);
      setUserId(result.userId);
      setRegistrationEmail(formData.email);
      // Salva la password per il login automatico successivo
      setPassword(formData.password);
      // Passa al secondo step (verifica codice)
      setActiveStep(1);
    } catch (err) {
      // Gli errori sono già gestiti dal contesto di autenticazione
      console.error('Registrazione fase 1 fallita:', err);
    }
  };
  /**
   * Gestisce la verifica del codice OTP nel secondo step
   * Completa la registrazione e autentica l'utente se il codice è corretto
   * 
   * @param {Object} e - Evento di submit del form
   */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    // Verifica che il codice sia stato inserito
    if (!verificationCode) {
      setValidationErrors({ code: 'Il codice di verifica è obbligatorio' });
      return;
    }

    try {
      // Usa la funzione che verifica il codice e autentica contemporaneamente
      await verifyAndLogin(userId, verificationCode);
      // Reindirizza alla home page dopo la verifica e autenticazione completate
      navigate('/');
    } catch (err) {
      console.error('Verifica fallita:', err);
      setValidationErrors({ code: err.message || 'Verifica fallita. Riprova.' });
    }
  };
  /**
   * Renderizza il contenuto del form in base allo step attuale
   * Ogni step ha un form diverso con campi specifici
   * 
   * @returns {JSX.Element} Contenuto del form per lo step attuale
   */
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box component="form" onSubmit={handleSubmitStep1} sx={{ width: '100%' }}>
            {/* Campo per il nome completo dell'utente */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              disabled={loading}
            />
            {/* Campo per l'indirizzo email */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Indirizzo Email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
            />            {/* Campo per la password con toggle per mostrare/nascondere */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />            {/* Campo per confermare la password */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Conferma Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={loading}
            />
            {/* Pulsante per inviare il form del primo step */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Continua'}
            </Button>
          </Box>
        );      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyCode} sx={{ width: '100%' }}>
            {/* Messaggio informativo che spiega come procedere */}
            <Alert severity="info" sx={{ mb: 2 }}>
              Un codice di verifica è stato inviato a {registrationEmail}. Controlla la tua email e inserisci il codice qui sotto.
            </Alert>
            {/* Campo per inserire il codice di verifica ricevuto via email */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="Codice di Verifica"
              name="verificationCode"
              autoComplete="off"
              autoFocus
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={!!validationErrors.code}
              helperText={validationErrors.code}
              disabled={loading}
            />
            {/* Pulsante per verificare il codice e completare la registrazione */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verifica e Completa Registrazione'}
            </Button>
            {/* Pulsante per tornare al passaggio precedente */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setActiveStep(0)}
              sx={{ mb: 2 }}
              disabled={loading}
            >
              Indietro
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };
  /**
   * Rendering del componente di registrazione
   * 
   * La struttura include:
   * - Container centrato con larghezza massima
   * - Card con elevazione per il form
   * - Stepper per mostrare il progresso del processo di registrazione
   * - Form dinamici in base allo step attuale
   */
  return (
    <Container maxWidth="sm">
      {/* Contenitore principale centrato con margini */}
      <Box 
        sx={{ 
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Card con elevazione per il form di registrazione */}
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {/* Titolo della pagina */}
          <Typography component="h1" variant="h5" gutterBottom>
            Crea Account
          </Typography>

          {/* Stepper per visualizzare il progresso della registrazione */}
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Visualizzazione condizionale dei messaggi di errore */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Contenuto del form in base allo step attuale */}
          {renderStepContent()}

          {/* Link per accedere se si ha già un account (mostrato solo nel primo step) */}
          {activeStep === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Hai già un account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Accedi qui
                </Link>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
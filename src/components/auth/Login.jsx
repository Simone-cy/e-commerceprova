/**
 * Login.jsx
 * 
 * Questo file implementa la pagina di login dell'applicazione e-commerce.
 * Gestisce l'autenticazione dell'utente con email e password,
 * validazione dei dati di input, e reindirizzamenti appropriati
 * dopo l'autenticazione riuscita o fallita.
 */

// Importazione degli hook React necessari
import { useState, useContext } from 'react';
// Importazione dei componenti di navigazione per gestire reindirizzamenti
import { useNavigate, useLocation, Link } from 'react-router-dom';
// Importazione del contesto di autenticazione per le operazioni di login
import { AuthContext } from '../../contexts/AuthContext';
// Importazione dei componenti Material-UI
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  createTheme,
  ThemeProvider
} from '@mui/material';

/**
 * Componente principale per la pagina di login
 * Gestisce l'interfaccia utente e la logica per l'autenticazione
 */
function Login() {
  // Hook per la navigazione programmatica verso altre pagine
  const navigate = useNavigate();
  // Hook per accedere ai parametri di location (utile per i reindirizzamenti post-login)
  const location = useLocation();
  // Accesso alle funzioni e stati di autenticazione dal contesto globale
  const { login, loading, error } = useContext(AuthContext);
  
  /**
   * Stato locale per i dati inseriti nel form di login
   * Memorizza email e password durante la digitazione dell'utente
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });  /**
   * Tema personalizzato per gli input del form di login
   * Definisce stili coerenti per migliorare l'esperienza utente e l'aspetto dei campi
   */
  const inputTheme = createTheme({
    components: {
      // Stile di base per tutti gli input
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: '#000000', // Colore del testo nero per una migliore visibilità e leggibilità
          },
        },
      },
      // Stile specifico per gli input con contorno
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2', // Colore del bordo blu al passaggio del mouse
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2', // Colore del bordo quando l'input è attivo
            },
          },
          notchedOutline: {
            borderColor: 'rgba(0, 0, 0, 0.23)', // Colore del bordo predefinito
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: 'rgba(0, 0, 0, 0.6)',
            '&.Mui-focused': {
              color: '#1976d2',
            },
          },
        },
      },
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      // Reindirizza alla pagina che stavano cercando di visitare o alla home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      // L'errore è gestito da AuthContext
      console.error('Login fallito:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: '#ffffff', // Ensure white background
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <ThemeProvider theme={inputTheme}>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                sx={{ input: { color: '#000000' } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                sx={{ input: { color: '#000000' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    Register here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </ThemeProvider>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
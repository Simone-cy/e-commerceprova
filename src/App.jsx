/**
 * App.jsx - Componente principale dell'applicazione e-commerce
 * 
 * Questo file rappresenta il punto di ingresso dell'applicazione React, dove vengono definiti:
 * - Struttura di navigazione con React Router
 * - Configurazione del tema dell'UI con Material-UI
 * - Provider di contesto per la gestione dello stato globale
 * - Layout principale dell'applicazione
 * 
 * L'applicazione è strutturata in una gerarchia di componenti che include pagine pubbliche
 * accessibili a tutti gli utenti e pagine protette che richiedono autenticazione.
 */

// Importazione dei componenti di routing di React Router per gestire la navigazione
import { Routes, Route, Navigate } from 'react-router-dom';
// Importazione dei componenti Material-UI per la gestione del tema e stili base
import { ThemeProvider, CssBaseline, createTheme, Box } from '@mui/material';
// Componenti di layout dell'applicazione
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
// Componenti delle pagine principali dell'applicazione
import Home from './components/pages/Home';
import Products from './components/pages/Products';
import ProductDetail from './components/pages/ProductDetail';
import Cart from './components/pages/Cart';
import Wishlist from './components/pages/Wishlist';
import Checkout from './components/pages/Checkout';
import Contact from './components/pages/Contact';
import ImageDebugPage from './components/pages/ImageDebugPage';
// Componenti per la gestione dell'autenticazione utente
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TwoFactorAuth from './components/auth/TwoFactorAuth';
// Componenti dell'area amministrativa riservata
import AdminProducts from './components/admin/AdminProducts';
// Provider dei contesti per la condivisione dello stato globale tra componenti
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ReviewProvider } from './contexts/ReviewContext';

/**
 * Creazione del tema personalizzato per l'applicazione
 * 
 * Il tema definisce la palette di colori principale e altre proprietà visive
 * che verranno applicate in modo coerente a tutti i componenti Material-UI.
 * Questo garantisce un'esperienza utente visivamente uniforme.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Colore primario (blu) usato per elementi principali come pulsanti e header
    },
    secondary: {
      main: '#dc004e', // Colore secondario (rosa/rosso) usato per elementi di accent e call-to-action
    },
  },
});

/**
 * Componente di layout principale che avvolge tutte le pagine dell'applicazione
 * 
 * Questo componente definisce la struttura base di ogni pagina, composta da:
 * - Navbar (header) in cima
 * - Contenuto principale che si espande per occupare lo spazio disponibile
 * - Footer in basso
 * 
 * Il layout utilizza flexbox per garantire che il footer resti sempre in fondo,
 * anche quando il contenuto della pagina è minimo.
 * 
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Contenuto da renderizzare nella parte centrale
 * @returns {JSX.Element} Layout completo dell'applicazione
 */
const MainLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Box sx={{ flex: 1 }}>{children}</Box>
    <Footer />
  </div>
);

/**
 * Componente principale dell'applicazione e-commerce
 * 
 * Questo componente è responsabile di:
 * 1. Applicare il tema Material-UI a tutta l'applicazione
 * 2. Configurare i provider di contesto per gestire lo stato globale
 * 3. Definire le rotte dell'applicazione e la navigazione
 * 4. Strutturare il layout base dell'applicazione
 * 
 * L'applicazione utilizza un sistema di routing che distingue tra:
 * - Rotte pubbliche: accessibili a tutti gli utenti
 * - Rotte protette: accessibili solo agli utenti autenticati
 * - Rotte amministrative: accessibili solo agli utenti con privilegi di amministratore
 * 
 * @returns {JSX.Element} L'applicazione completa con routing e provider configurati
 */
function App() {
  return (
    // Provider del tema Material-UI per applicare stili coerenti in tutta l'app
    <ThemeProvider theme={theme}>
      {/* Reset CSS per normalizzare gli stili tra i diversi browser e garantire consistenza */}
      <CssBaseline />
      {/* Provider di contesto nidificati per condividere lo stato globale tra i componenti */}
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ReviewProvider>
              <MainLayout>
                <Routes>
                {/* Route pubbliche: accessibili a tutti gli utenti, autenticati e non */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/2fa" element={<TwoFactorAuth />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetail />} />
                <Route path="/wishlist/:userId" element={<Wishlist />} />
                
                {/* Route protette: richiedono che l'utente sia autenticato per accedere */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
                
                {/* Route per l'area amministrativa: accessibili solo agli utenti con ruolo admin */}
                <Route path="/admin/products" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminProducts />
                  </ProtectedRoute>
                } />
                
                {/* Route di fallback: reindirizza alla home quando l'URL richiesto non esiste */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </MainLayout>
            </ReviewProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

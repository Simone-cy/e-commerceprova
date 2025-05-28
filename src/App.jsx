/**
 * App.jsx: Componente principale e punto di ingresso dell'applicazione.
 * Definisce routing, tema, provider di contesto e layout.
 * Include gestione di rotte pubbliche e protette.
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
import DemoAdmin from './components/admin/DemoAdmin';
// Provider dei contesti per la condivisione dello stato globale tra componenti
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ReviewProvider } from './contexts/ReviewContext';

/**
 * Tema Material-UI personalizzato per l'applicazione.
 * Definisce la palette di colori (primario, secondario) per coerenza visiva.
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
 * Layout principale dell'applicazione (Navbar, Contenuto, Footer).
 * Utilizza flexbox per mantenere il footer in basso.
 * @param {Object} props Contiene `children` da renderizzare.
 * @returns {JSX.Element} Struttura di layout.
 */
const MainLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Box sx={{ flex: 1 }}>{children}</Box>
    <Footer />
  </div>
);

/**
 * Componente App: radice dell'applicazione.
 * Configura ThemeProvider, CssBaseline, e i provider di contesto (Auth, Cart, Wishlist, Review).
 * Definisce le rotte principali (pubbliche, protette, admin) all'interno di MainLayout.
 * @returns {JSX.Element} Applicazione renderizzata.
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
                <Route path="/demo-admin" element={<DemoAdmin />} />
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

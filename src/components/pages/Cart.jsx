/**
 * Componente Cart
 * 
 * Questo componente implementa la pagina del carrello dell'applicazione e-commerce.
 * Consente agli utenti di:
 * - Visualizzare gli articoli aggiunti al carrello
 * - Modificare le quantità degli articoli
 * - Rimuovere articoli dal carrello
 * - Visualizzare il riepilogo dell'ordine con il totale
 * - Procedere al checkout
 * 
 * La pagina è accessibile solo agli utenti autenticati, come definito nelle
 * route protette nell'App.jsx.
 * 
 * @module components/pages/Cart
 */

// Importazione degli hook React necessari per la gestione dello stato e del contesto
import { useContext } from 'react';
// Importazione del contesto del carrello per accedere e manipolare gli articoli
import { CartContext } from '../../contexts/CartContext';
// Importazione del hook di navigazione per reindirizzamenti programmati
import { useNavigate } from 'react-router-dom';
// Importazione dei componenti Material-UI per l'interfaccia utente
import { 
  Container, Typography, Button, Grid, Card, 
  CardContent, CardMedia, IconButton, Box 
} from '@mui/material';
// Importazione delle icone Material-UI per i controlli di quantità e rimozione
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
// Importazione dell'utility per gestire gli URL delle immagini con proxy
import { getProxiedImageUrl } from '../../config/imageUtils';
// Importazione del componente per immagini con gestione degli errori di caricamento
import ImageWithFallback from '../ui/ImageWithFallback';

/**
 * Componente principale della pagina del carrello
 * 
 * Gestisce la visualizzazione e l'interazione con gli articoli nel carrello dell'utente.
 * Mostra un'interfaccia diversa in base allo stato del carrello:
 * - Se vuoto: mostra un messaggio e un pulsante per continuare lo shopping
 * - Se non vuoto: mostra la lista degli articoli con controlli e il riepilogo dell'ordine
 * 
 * @returns {JSX.Element} Il componente della pagina del carrello renderizzato
 */
function Cart() {
  // Accesso alle funzioni e ai dati del carrello tramite il context
  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);
  // Hook per la navigazione programmatica tra le pagine
  const navigate = useNavigate();

  // Calcolo dell'importo totale dell'ordine moltiplicando prezzo per quantità di ogni articolo
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  /**
   * Visualizzazione per carrello vuoto
   * 
   * Se non ci sono articoli nel carrello, mostra un messaggio informativo
   * e un pulsante per tornare alla pagina dei prodotti.
   */
  if (cart.length === 0) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" gutterBottom>Il tuo carrello è vuoto</Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Continua lo Shopping
        </Button>
      </Container>
    );
  }  /**
   * Visualizzazione principale per carrello con articoli
   * 
   * Struttura della pagina:
   * - Intestazione con titolo della pagina
   * - Griglia a due colonne: 
   *   - Colonna sinistra (più grande): lista degli articoli nel carrello
   *   - Colonna destra: riepilogo dell'ordine con totale e pulsante checkout
   */
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>Carrello Acquisti</Typography>
      
      <Grid container spacing={3}>
        {/* Colonna sinistra - lista degli articoli nel carrello */}
        <Grid item xs={12} md={8}>
          {cart.map((item) => (
            <Card key={item.id} sx={{ mb: 2, display: 'flex' }}>
              {/* Contenitore per l'immagine del prodotto con sfondo neutro */}
              <Box sx={{ width: 151, bgcolor: '#f5f5f5' }}>
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  height={151}
                  width={151}
                  retryCount={2} // Tentativi di ricaricamento in caso di errore
                />
              </Box>
              
              {/* Contenitore per i dettagli e i controlli del prodotto */}
              <CardContent sx={{ flex: 1 }}>
                {/* Nome del prodotto */}
                <Typography variant="h6">{item.name}</Typography>
                {/* Prezzo unitario del prodotto */}
                <Typography variant="body2" color="text.secondary">
                  €{item.price}
                </Typography>
                
                {/* Barra dei controlli per modificare quantità o rimuovere l'articolo */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  {/* Pulsante per diminuire la quantità - disabilitato se quantità è 1 */}
                  <IconButton 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1} // Impedisce quantità negative o zero
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  {/* Visualizzazione della quantità corrente */}
                  <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                  
                  {/* Pulsante per aumentare la quantità */}
                  <IconButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <AddIcon />
                  </IconButton>
                  
                  {/* Pulsante per rimuovere completamente l'articolo dal carrello */}
                  <IconButton 
                    onClick={() => removeFromCart(item.id)}
                    sx={{ ml: 'auto' }}
                    aria-label="Rimuovi dal carrello"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
        
        {/* Colonna destra - riepilogo dell'ordine */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Riepilogo Ordine</Typography>
              
              {/* Conteggio totale degli articoli nel carrello */}
              <Typography variant="body1">
                Articoli Totali: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Typography>
              
              {/* Importo totale dell'ordine formattato con due decimali */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Totale: €{total.toFixed(2)}
              </Typography>
              
              {/* Pulsante per procedere al checkout e completare l'acquisto */}
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/checkout')}
              >
                Procedi al Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Cart;

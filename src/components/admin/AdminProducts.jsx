/**
 * AdminProducts.jsx
 * 
 * Questo file implementa l'interfaccia di amministrazione per la gestione dei prodotti
 * dell'e-commerce. Fornisce funzionalità complete per:
 * - Visualizzare l'elenco di tutti i prodotti presenti nel sistema
 * - Aggiungere nuovi prodotti con immagini, descrizioni e prezzi
 * - Modificare i dettagli dei prodotti esistenti
 * - Eliminare prodotti dal catalogo
 * - Gestire prodotti in evidenza e offerte speciali
 * 
 * L'accesso a questa pagina è limitato agli utenti con ruolo di amministratore,
 * come implementato tramite il componente ProtectedRoute nell'App.jsx.
 */

// Importazione degli hook React necessari per gestione stato ed effetti collaterali
import { useState, useEffect } from 'react';
// Importazione dei componenti Material-UI per l'interfaccia utente
import {
    Container, Typography, Button, TextField, Grid, Card, Switch, FormControlLabel,
    CardContent, CardMedia, Dialog, DialogTitle, DialogContent,
    DialogActions, Box, CircularProgress, Snackbar, Alert, IconButton,
    CardActions, Tab, Tabs, Chip
} from '@mui/material';
// Importazione delle icone Material-UI
import { PhotoCamera, Delete as DeleteIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

// Importazione della configurazione API centralizzata
import { API_BASE_URL } from '../../config/api';
// Importazione dell'utility per le immagini
import { getProxiedImageUrl } from '../../config/imageUtils';
// Immagine SVG di fallback per prodotti senza immagine
const FALLBACK_IMAGE_ADMIN = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23757575">No Image</text></svg>';
// URL dell'API per gestire i prodotti
const API_URL = `${API_BASE_URL}/api.php`;

/**
 * Componente per la gestione dei prodotti nell'area amministrativa
 * Fornisce le funzionalità CRUD per i prodotti: visualizzazione, creazione, modifica ed eliminazione
 */
function AdminProducts() {
  // Stato per l'elenco dei prodotti
  const [products, setProducts] = useState([]);
  // Stato di caricamento per mostrare il loader
  const [loadingProducts, setLoadingProducts] = useState(true);
  // Stato per il controllo del dialogo di modifica/creazione
  const [open, setOpen] = useState(false);
  // Flag per distinguere tra modifica e creazione di un prodotto
  const [isEditing, setIsEditing] = useState(false);
  // Prodotto attualmente in modifica
  const [currentProduct, setCurrentProduct] = useState(null);
  // Valore corrente del tab per filtrare i prodotti ('all' o 'trending')
  const [tabValue, setTabValue] = useState('all'); 
  // Dati del form per la creazione/modifica di un prodotto
  const [formData, setFormData] = useState({
    name: '',         // Nome del prodotto
    price: '',        // Prezzo del prodotto
    description: '',  // Descrizione del prodotto
    image: null,      // File dell'immagine del prodotto
    immagine_id: null, // ID dell'immagine nel sistema
    trending: false   // Flag per prodotti in tendenza
  });
  // Anteprima dell'immagine caricata
  const [imagePreview, setImagePreview] = useState(null);
  // Stato di invio del form
  const [submitting, setSubmitting] = useState(false);
  // Stato per le notifiche di feedback all'utente
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Caricamento iniziale dei prodotti quando il componente viene montato
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Funzione per caricare i prodotti dal server
   * Imposta lo stato di caricamento e gestisce errori e risultati
   */
  const fetchProducts = () => {
    setLoadingProducts(true);
    fetch(`${API_URL}?path=products`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setNotification({ open: true, message: `Error fetching products: ${error.message}`, severity: 'error' });
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  };

  /**
   * Apre il dialog di modifica o creazione prodotto
   * @param {Object|null} product - Prodotto da modificare, o null per creazione
   */
  const handleOpenDialog = (product = null) => {
    if (product) {
      setIsEditing(true);
      setCurrentProduct(product);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        image: product.image || null,
        immagine_id: product.immagine_id || null,
        trending: product.trending || false
      });
      setImagePreview(product.image || null);
    } else {
      setIsEditing(false);
      setCurrentProduct(null);
      setFormData({ 
        name: '', 
        price: '', 
        description: '', 
        image: null, 
        immagine_id: null,
        trending: false 
      });
      setImagePreview(null);
    }
    setOpen(true);
  };

  /**
   * Chiude il dialog di modifica/creazione
   */
  const handleCloseDialog = () => {
    setOpen(false);
  };

  /**
   * Gestisce i cambiamenti nei campi del form
   * @param {Event} e - Evento di input
   */
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  /**
   * Gestisce il caricamento e l'upload dell'immagine del prodotto
   * @param {Event} e - Evento di selezione file
   */
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Crea un'anteprima dell'immagine selezionata
    setImagePreview(URL.createObjectURL(file)); 
    
    // Prepara i dati per l'upload
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    const token = localStorage.getItem('token');

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}?path=upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image: data.url, immagine_id: data.id }));
        setNotification({ open: true, message: 'Image uploaded successfully!', severity: 'success' });
      } else {
        throw new Error(data.error || 'Image upload failed');
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setNotification({ open: true, message: `Image upload error: ${error.message}`, severity: 'error' });
      setImagePreview(isEditing && currentProduct ? currentProduct.image : null);
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * Rimuove l'immagine attualmente selezionata
   */
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null, immagine_id: null }));
    setImagePreview(null);
    setNotification({ open: true, message: 'Image marked for removal.', severity: 'info' });
  };

  /**
   * Invia il form per creare o modificare un prodotto
   * @param {Event} e - Evento submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    // Prepara i dati da inviare all'API
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      image: formData.image,
      immagine_id: formData.immagine_id,
      trending: formData.trending
    };

    // Determina se è una creazione o un aggiornamento
    const method = isEditing && currentProduct ? 'PUT' : 'POST';
    if (method === 'PUT') {
      payload.id = currentProduct.id;
    }

    try {
      const response = await fetch(`${API_URL}?path=products`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setNotification({ open: true, message: data.message || `Product ${isEditing ? 'updated' : 'created'} successfully!`, severity: 'success' });
        handleCloseDialog();
        fetchProducts(); // Aggiorna la lista prodotti
      } else {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setNotification({ open: true, message: `Submit error: ${error.message}`, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * Gestisce l'impostazione/rimozione di un prodotto come "trending"
   * @param {Object} product - Il prodotto da modificare
   */
  const handleToggleTrending = async (product) => {
    setSubmitting(true);
    const token = localStorage.getItem('token');

    // Verifica quanti prodotti trending ci sono già
    const currentTrendingCount = products.filter(p => p.trending && p.id !== product.id).length;
    
    // Se stiamo cercando di aggiungere un prodotto e ne abbiamo già 4, mostra un errore
    if (!product.trending && currentTrendingCount >= 4) {
      setNotification({
        open: true,
        message: "Puoi avere massimo 4 prodotti trending. Rimuovi un prodotto trending prima di aggiungerne un altro.",
        severity: "warning"
      });
      setSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}?path=products`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: product.id,
          trending: !product.trending
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({ 
          open: true, 
          message: `Product ${!product.trending ? 'set as trending' : 'removed from trending'}`, 
          severity: 'success' 
        });
        fetchProducts(); // Aggiorna la lista prodotti
      } else {
        throw new Error(data.error || 'Failed to update trending status');
      }
    } catch (error) {
      console.error("Trending update error:", error);
      setNotification({ open: true, message: `Update error: ${error.message}`, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  
  /**
   * Gestisce la disattivazione/eliminazione di un prodotto
   * @param {string|number} productId - ID del prodotto da eliminare
   */
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to deactivate this product? This action cannot be undone from the UI.")) return;
    
    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}?path=products`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      });
      const data = await response.json();
      
      if (data.success) {
        setNotification({ open: true, message: data.message || 'Product deactivated!', severity: 'success' });
        fetchProducts(); // Aggiorna la lista prodotti
      } else {
        throw new Error(data.error || 'Failed to deactivate product');
      }
    } catch (error) {
      console.error("Delete error:", error);
      setNotification({ open: true, message: `Delete error: ${error.message}`, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Chiude la notifica di feedback
   * @param {Event} event - Evento di chiusura
   * @param {string} reason - Motivo della chiusura
   */
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  /**
   * Gestisce il cambio di tab per filtrare i prodotti
   * @param {Event} event - Evento di cambio tab
   * @param {string} newValue - Nuovo valore del tab ('all' o 'trending')
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filtra i prodotti in base al tab selezionato
  const filteredProducts = tabValue === 'trending' 
    ? products.filter(product => product.trending) 
    : products;

  // Conta i prodotti trending
  const trendingProductsCount = products.filter(product => product.trending).length;

  // Mostra un loader durante il caricamento
  if (loadingProducts) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // Rendering del componente
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Product Management</Typography>
      
      {/* Tabs e pulsante di aggiunta prodotto */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="product filter tabs">
          <Tab label="All Products" value="all" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Trending Products</span>
                <Chip 
                  size="small" 
                  label={trendingProductsCount} 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              </Box>
            } 
            value="trending" 
          />
        </Tabs>
        <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
          Add New Product
        </Button>
      </Box>

      {/* Avviso se ci sono troppi prodotti trending */}
      {trendingProductsCount > 4 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have {trendingProductsCount} trending products. Only the first 4 will be shown on the home page.
        </Alert>
      )}

      {/* Griglia dei prodotti */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              {/* Badge per prodotti trending */}
              {product.trending && (
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 10, 
                    left: 10, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 0.5, 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    zIndex: 1
                  }}
                >
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Trending
                </Box>
              )}
              {/* Immagine del prodotto */}
              <CardMedia
                component="img"
                height="200"
                image={getProxiedImageUrl(product.image) || FALLBACK_IMAGE_ADMIN}
                alt={product.name}
                sx={{ objectFit: 'contain', p:1 }}
              />
              {/* Contenuto della card */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div">{product.name}</Typography>
                <Typography color="text.secondary">${parseFloat(product.price).toFixed(2)}</Typography>
                <Typography variant="body2" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {product.description}
                </Typography>
              </CardContent>
              {/* Azioni disponibili per ogni prodotto */}
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button size="small" onClick={() => handleOpenDialog(product)} disabled={submitting}>
                    Edit
                  </Button>
                  <IconButton 
                    size="small" 
                    color={product.trending ? "primary" : "default"}
                    onClick={() => handleToggleTrending(product)}
                    disabled={submitting}
                    title={product.trending ? "Remove from trending" : "Set as trending"}
                  >
                    <TrendingUpIcon />
                  </IconButton>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product.id)} disabled={submitting}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Messaggio quando non ci sono prodotti */}
      {filteredProducts.length === 0 && !loadingProducts && (
        <Typography sx={{ mt: 3, textAlign: 'center' }}>
          {tabValue === 'trending' 
            ? 'No trending products. Use the trending icon to feature products on the home page.'
            : 'No products found. Click "Add New Product" to get started.'}
        </Typography>
      )}

      {/* Dialog per creazione/modifica prodotto */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {/* Campo nome */}
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              disabled={submitting}
            />
            {/* Campo prezzo */}
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{ inputProps: { step: "0.01", min: "0" } }}
              disabled={submitting}
            />
            {/* Campo descrizione */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              required
              disabled={submitting}
            />
            
            {/* Switch per prodotto trending */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.trending}
                  onChange={handleChange}
                  name="trending"
                  color="primary"
                  disabled={submitting}
                />
              }
              label="Show as Trending Product on Home Page"
              sx={{ mt: 1, mb: 1 }}
            />
            
            {/* Sezione per gestione immagine */}
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Product Image</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={submitting}
              >
                {imagePreview || formData.image ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
              </Button>
              {(imagePreview || formData.image) && (
                <IconButton onClick={handleRemoveImage} color="error" disabled={submitting} title="Remove current image">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            {/* Anteprima immagine */}
            {(imagePreview || formData.image) && (
              <Box sx={{ mt: 1, textAlign: 'center', border: '1px dashed grey', padding: 1, minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={imagePreview || formData.image}
                  alt="Preview" 
                  style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} 
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        {/* Pulsanti azione dialog */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitting || !formData.name || !formData.price || !formData.description}
          >
            {submitting ? <CircularProgress size={24} /> : (isEditing ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sistema di notifiche */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminProducts;

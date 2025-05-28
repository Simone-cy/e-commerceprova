/**
 * Navbar.jsx
 * 
 * Questo file implementa la barra di navigazione principale dell'applicazione e-commerce.
 * Gestisce il menu di navigazione, l'accesso all'autenticazione, le icone del carrello
 * e della wishlist con badge che mostrano il numero di elementi, e un menu utente
 * responsive per dispositivi mobili e desktop.
 */

// Importazione degli hook React necessari
import { useState, useContext } from 'react';
// Importazione dei componenti di routing per la navigazione
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
// Importazione dei contesti per accedere a dati di autenticazione, carrello e lista desideri
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext'; // Assicurati che il percorso sia corretto

/**
 * Componente Navbar: barra di navigazione principale.
 * Gestisce layout responsivo, menu, link e icone utente/carrello/wishlist.
 */
function Navbar() {
  // Accesso al tema Material-UI per applicare stili responsivi
  const theme = useTheme();
  // Determina se il dispositivo è mobile per adattare il layout
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Hook per la navigazione programmatica tra le pagine
  const navigate = useNavigate();
  // Hook per ottenere il percorso corrente dell'URL e evidenziare il link attivo
  const location = useLocation();
  // Accesso ai dati utente e alle funzioni di autenticazione dal contesto
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  // Accesso ai dati del carrello per mostrare il numero di prodotti
  const { cart } = useContext(CartContext);
  // Accesso ai dati della wishlist per mostrare il numero di prodotti salvati
  const { wishlist } = useContext(WishlistContext);

  // Stati per gestire l'apertura dei vari menu a discesa
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  // Gestori per l'apertura e chiusura dei menu di navigazione
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  // Gestore per l'apertura del menu utente
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  // Gestore per la chiusura del menu di navigazione
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pages = [
    { title: 'Home', path: '/' },
    { title: 'Products', path: '/products' },
    { title: 'Contact', path: '/contact' },
    { title: 'Demo Admin', path: '/demo-admin' }
  ];

  const authPages = isAuthenticated() ? [
    { title: 'Cart', path: '/cart', icon: 
      <Badge badgeContent={cartItemsCount} color="error">
        <ShoppingCartIcon />
      </Badge> 
    },
    { title: 'Wishlist', path: '/wishlist', icon: 
      <Badge 
        badgeContent={wishlist.length} 
        color="error"
        invisible={wishlist.length === 0}
      >
        <FavoriteIcon />
      </Badge> 
    }
  ] : [];

  if (isAdmin()) {
    pages.push({ title: 'Admin', path: '/admin/products' });
  }

  // Funzione per verificare se il link è attivo
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo/Brand - visible on desktop */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            E-STORE
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => {
                const active = isActive(page.path);
                return (
                  <MenuItem 
                    key={page.path} 
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(page.path);
                    }}
                    sx={{
                      backgroundColor: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    }}
                  >
                    <Typography 
                      textAlign="center"
                      sx={{
                        fontWeight: active ? 'bold' : 'normal',
                        position: 'relative',
                        color: active ? 'primary.main' : 'inherit',
                      }}
                    >
                      {page.title}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          {/* Logo/Brand - visible on mobile */}
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            E-STORE
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => {
              const active = isActive(page.path);
              return (
                <Button
                  key={page.path}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    mx: 0.5,
                    color: 'white',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: active ? '100%' : '0',
                      height: '1px',  // Ridotto da 2px a 1px
                      bottom: '6px',
                      left: 0,
                      backgroundColor: 'white',
                      transition: 'width 0.3s ease-in-out',
                    },
                    '&:hover::after': {
                      width: '100%',
                    },
                    fontWeight: active ? 'bold' : 'normal',
                  }}
                >
                  {page.title}
                </Button>
              );
            })}
          </Box>

          {/* Cart and Wishlist icons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {authPages.map((page) => {
              const active = isActive(page.path);
              return (
                <IconButton
                  key={page.path}
                  component={RouterLink}
                  to={page.path}
                  color="inherit"
                  sx={{ 
                    ml: 1,
                    position: 'relative',
                    bgcolor: 'rgba(255, 255, 255, 0.2)', // Aumentato contrasto dello sfondo
                    borderRadius: '50%', 
                    width: 40, 
                    height: 40, 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Aggiunto ombra per far risaltare
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)', // Effetto hover più visibile
                    },
                    '& svg': {
                      fontSize: '1.4rem', // Icona leggermente più grande
                      color: 'white', // Assicura che l'icona sia bianca
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: active ? '100%' : '0',
                      height: '1px',
                      bottom: '-4px',
                      left: 0,
                      backgroundColor: 'white',
                      transition: 'width 0.3s ease-in-out',
                      borderRadius: '2px',
                    },
                    ...(active && {
                      bgcolor: 'rgba(255, 255, 255, 0.3)', // Stato attivo più evidente
                      '& svg': {
                        color: 'white', // Più visibile quando attivo
                      }
                    })
                  }}
                >
                  {page.icon}
                </IconButton>
              );
            })}
          </Box>

          {/* User menu */}
          <Box sx={{ ml: 2 }}>
            {isAuthenticated() ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0,
                      width: 40, // Dimensione fissa
                      height: 40, // Dimensione fissa
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.1)', // Manteniamo lo sfondo leggero
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)', // Effetto hover
                      }
                    }}
                  >
                    <Avatar 
                      alt={user?.name} 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 32, // Leggermente più piccolo dell'IconButton
                        height: 32  // Leggermente più piccolo dell'IconButton
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                startIcon={<PersonIcon />}
                sx={{
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: location.pathname === '/login' ? '100%' : '0',
                    height: '1px',  // Ridotto da 2px a 1px
                    bottom: '4px',
                    left: 0,
                    backgroundColor: 'white',
                    transition: 'width 0.3s ease-in-out',
                  },
                  '&:hover::after': {
                    width: '100%',
                  },
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;

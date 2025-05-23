/**
 * Footer.jsx: Componente piè di pagina dell'applicazione.
 * Contiene copyright, link e info sul progetto. Ottimizzato con React.memo.
 */

// Importazione dei componenti Material-UI necessari per la costruzione del footer
import { Box, Typography, Container, Link } from '@mui/material';
// Importazione di memo per ottimizzare le prestazioni prevenendo re-rendering inutili
import { memo } from 'react';

/**
 * Stili CSS per il footer.
 */
const footerStyles = {
  py: 6,                   // Padding verticale (top e bottom)
  mt: 8,                   // Margine superiore per distanziamento dal contenuto
  borderTop: '1px solid',  // Bordo superiore per separazione visiva
  borderColor: 'divider',  // Colore del bordo preso dal tema (subtile)
  textAlign: 'center',     // Testo centrato orizzontalmente
  bgcolor: 'background.paper' // Colore di sfondo dal tema
};

/**
 * Componente Footer (memoizzato).
 * Mostra copyright, info tecnologie e progetto.
 * @returns {JSX.Element} Il componente footer.
 */
const Footer = memo(() => {
  // Ottiene dinamicamente l'anno corrente per mantenere aggiornato il copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={footerStyles}>
      <Container maxWidth="lg">
        {/* Riga del copyright con l'anno corrente e il nome dell'autore */}
        <Typography variant="body2" color="text.secondary">
          © {currentYear} Portfolio Project by Simone Ruggiero
        </Typography>
        {/* Informazioni sulle tecnologie utilizzate con link esterni alle rispettive documentazioni */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Creato con <Link href="https://reactjs.org/" target="_blank" rel="noopener">React</Link>, 
          <Link href="https://mui.com/" target="_blank" rel="noopener"> Material UI</Link> e ❤️ | 
          Applicazione E-commerce Dimostrativa
        </Typography>
      </Container>
    </Box>
  );
});

// Assegna un displayName al componente memorizzato per una migliore esperienza di debugging
Footer.displayName = 'Footer';

// Esporta il componente Footer per l'utilizzo in altri file
export default Footer;

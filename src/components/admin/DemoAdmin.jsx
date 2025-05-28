/**
 * DemoAdmin.jsx
 * 
 * Questo componente implementa una pagina dimostrativa dell'interfaccia di amministrazione.
 * Mostra uno screenshot dell'interfaccia di amministrazione dei prodotti per 
 * scopi di presentazione e demo senza funzionalità interattive.
 */
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import adminScreenshot from '../../Screenshot 2025-05-28 122835.png';

function DemoAdmin() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Interfaccia di Amministrazione - Demo
      </Typography>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Box
          component="img"
          src={adminScreenshot}
          alt="Interfaccia di Amministrazione"
          sx={{ width: '100%', maxWidth: 1200, height: 'auto', borderRadius: 2 }}
        />
      </Paper>
    </Container>
  );
}

export default DemoAdmin;

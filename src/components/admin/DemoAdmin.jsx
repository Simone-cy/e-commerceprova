/**
 * Questo componente implementa una pagina dimostrativa dell'interfaccia di amministrazione.
 * Mostra uno screenshot dell'interfaccia di amministrazione dei prodotti per 
 * scopi di presentazione e demo senza funzionalità interattive.
 */
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function DemoAdmin() {
    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Interfaccia di Amministrazione per la gestione dei prodotti - Demo
            </Typography>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Box
                    component="img"
                    src="./Screenshot 2025-05-28 122835.png" 
                    alt="Interfaccia di Amministrazione"
                    sx={{ width: '100%', maxWidth: 800, borderRadius: 2 }}
                />
            </Paper>
        </Container>
    )
}

export default DemoAdmin;

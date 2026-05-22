import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentiRoutes from './routes/studenti.routes';
import docentiRoutes from './routes/docenti.routes';
import prenotazioniRoutes from './routes/prenotazioni.routes';
import notificheRoutes from './routes/notifiche.routes';
import segnalazioniRoutes from './routes/segnalazioni.routes';
import corsiRoutes from './routes/corsi.routes';
import bachecheRoutes from './routes/bacheche.routes';

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API UniMeet',
            version: '1.0.0',
            description: 'Documentazione API del progetto'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ['./routes/*.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', studentiRoutes);
app.use('/api', docentiRoutes);
app.use('/api', prenotazioniRoutes);
app.use('/api', notificheRoutes);
app.use('/api', segnalazioniRoutes);
app.use('/api', corsiRoutes);
app.use('/api', bachecheRoutes);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

export default app;

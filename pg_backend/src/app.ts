import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentiRoutes from './routes/studenti.routes';
import docentiRoutes from './routes/docenti.routes';
import prenotazioniRoutes from './routes/prenotazioni.routes';
import segnalazioniRoutes from './routes/segnalazioni.routes';
import corsiRoutes from './routes/corsi.routes';
import bachecheRoutes from './routes/bacheche.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', studentiRoutes);
app.use('/api', docentiRoutes);
app.use('/api', prenotazioniRoutes);
app.use('/api', segnalazioniRoutes);
app.use('/api', corsiRoutes);
app.use('/api', bachecheRoutes);

export default app;

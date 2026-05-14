import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentiRoutes from './routes/studenti.routes';
import docentiRoutes from './routes/docenti.routes';
import prenotazioniRoutes from './routes/prenotazioni.routes';


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', studentiRoutes);
app.use('/api', docentiRoutes);
app.use('/api', prenotazioniRoutes);

export default app;

import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentiRoutes from './routes/studenti.routes';
import docentiRoutes from './routes/docenti.routes';
import prenotazioniRoutes from './routes/prenotazioni.routes';
import notificheRoutes from './routes/notifiche.routes';
import segnalazioniRoutes from './routes/segnalazioni.routes';
import corsiRoutes from './routes/corsi.routes';
import bachecheRoutes from './routes/bacheche.routes';
import corsiDiStudioRoutes from './routes/corsi-di-studio.routes';
 
const app = express();
const allowedOrigins = ['http://localhost:4200', 'http://localhost:8100', 'http://127.0.0.1:4200', 'http://127.0.0.1:8100'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
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
app.use('/api', corsiDiStudioRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

export default app;

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', adminRoutes);

export default app;

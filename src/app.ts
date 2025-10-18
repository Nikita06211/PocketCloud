import express from 'express';
import authRoutes from './routes/auth.ts';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
    console.log("👋 Hit / route");
    res.send('Server is alive!');
});

export default app;
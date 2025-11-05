import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.ts';
import fileRoutes from './routes/file.ts';


const app = express();

app.use(cors({
    origin: ['http://localhost:3001', 'https://pocketcloud.nikitabansal.xyz/']
    credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api', fileRoutes);


app.get('/', (_req, res) => {
    console.log("👋 Hit / route");
    res.send('Server is alive!');
});

export default app;
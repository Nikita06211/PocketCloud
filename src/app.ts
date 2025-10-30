import express from 'express';
import authRoutes from './routes/auth.ts';
import fileRoutes from './routes/file.ts';


const app = express();

app.use('/api/upload', express.raw({ 
    type: '*/*', 
    limit: '10mb' 
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', fileRoutes);


app.get('/', (_req, res) => {
    console.log("👋 Hit / route");
    res.send('Server is alive!');
});

export default app;
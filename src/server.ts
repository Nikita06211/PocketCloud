import app from './app';
import 'dotenv/config';
import { connectDB } from './config/db';

const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
import app from './app';
import 'dotenv/config';
import { connectDB } from './config/db';
import { S3Client } from '@aws-sdk/client-s3';
import { s3Service } from './services/s3Service';

const startServer = async () => {
    await s3Service.verifyConnection();
    await connectDB();
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
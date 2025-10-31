import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListBucketsCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

class S3Service {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    async verifyConnection(): Promise<void> {
        try{
            await this.s3Client.send(new ListBucketsCommand({}));
            console.log('✅ S3 client connected successfully');
        } catch (error) {
            console.error('❌ S3 connection verification failed:', error);
            throw error;
        }
    }

    async uploadFile(fileId: string, fileBuffer: Buffer, contentType: string): Promise<string> {
        const s3Key = `files/${fileId}`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
        }
        
        await this.s3Client.send(new PutObjectCommand(uploadParams));
        return s3Key;
    }

    async getFileUrl(s3Key: string): Promise<string>{
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: s3Key,
        });
        return await getSignedUrl(this.s3Client, command, {expiresIn: 3600});
    }

    async deleteFile(s3Key: string): Promise<void> {
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: s3Key,
        };
        
        await this.s3Client.send(new DeleteObjectCommand(deleteParams));
    }
}
export const s3Service = new S3Service();
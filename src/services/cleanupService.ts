import { findExpiredFiles, deleteFile } from '../repositories/fileRepository';
import { s3Service } from './s3Service';

export class CleanupService {
    async cleanupExpiredFiles(): Promise<{ deleted: number; errors: string[] }> {
        try {
            const expiredFiles = await findExpiredFiles();
            const errors: string[] = [];
            let deleted = 0;

            for (const file of expiredFiles) {
                try {
                    // Delete from S3 first
                    await s3Service.deleteFile(file.s3Key);
                    // Then delete from database
                    await deleteFile(file.id);
                    deleted++;
                } catch (error) {
                    const errorMsg = `Failed to delete file ${file.id}: ${error instanceof Error ? error.message : String(error)}`;
                    errors.push(errorMsg);
                    console.error(errorMsg);
                }
            }

            return { deleted, errors };
        } catch (error) {
            console.error('Cleanup service error:', error);
            throw error;
        }
    }
}

export const cleanupService = new CleanupService();
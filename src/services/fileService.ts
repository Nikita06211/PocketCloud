import { v4 as uuidv4 } from 'uuid';
import { s3Service } from './s3Service.ts';
import { createFile, findFileById, isFileExpired, deleteFile } from '../repositories/fileRepository';
import { FileType } from '../entities/File';
export interface UploadFileData {
    userId: number;
    expirationHours: number;
    fileName: string;
    fileType: FileType;
    fileBuffer: Buffer;
}

export interface FileUploadResult {
    fileId: string;
    publicLink: string;
    expiresAt: Date;
}

export class FileService {
    async uploadFile(data: UploadFileData): Promise<FileUploadResult> {
        const fileId = uuidv4();
        const contentType = this.getContentTypeFromFileType(data.fileType);

        const s3Key = await s3Service.uploadFile(fileId, data.fileBuffer, contentType);

        const fileData = {
            id: fileId,
            name: data.fileName,
            s3Key,
            fileType: data.fileType,
            expirationHours: data.expirationHours,
            userId: data.userId,
        };

        const savedFile = await createFile(fileData);

        const publicLink = `${process.env.BASE_URL}/files/${fileId}`;
        const expiresAt = new Date(Date.now() + savedFile.expirationHours * 60 * 60 * 1000);

        return {
            fileId,
            publicLink,
            expiresAt,
        };
    }

    async getFileForDisplay(fileId: string): Promise<{ file: any; presignedUrl: string } | null> {
        const file = await findFileById(fileId);
        if (!file) return null;

        const isExpired = await isFileExpired(fileId);
        if (isExpired) {
            await deleteFile(fileId);
            throw new Error("File has expired");
        }

        const presignedUrl = await s3Service.getFileUrl(file.s3Key);
        return {
            file,
            presignedUrl,
        };
    }

    private getContentTypeFromFileType(fileType: string): string {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return 'application/pdf';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'txt':
                return 'text/plain';
            default:
                return 'application/octet-stream';
        }
    }
}

export const fileService = new FileService();
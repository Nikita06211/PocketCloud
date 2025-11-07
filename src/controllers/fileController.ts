import type {Request, Response} from 'express';
import {fileService} from '../services/fileService';
import { FileType } from '../entities/File';
import type { AuthRequest } from '../middleware/auth';
import { deleteExpiredFiles, findExpiredFiles, findFilesByUserId } from '../repositories/fileRepository';
import { s3Service } from '../services/s3Service';
export const uploadFile = async(req: AuthRequest, res: Response)=>{
    try{
        const { expirationHours, fileName, fileType} = req.query as unknown as { expirationHours: number, fileName: string, fileType: FileType};
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
        if(!req.body || !Buffer.isBuffer(req.body)) return res.status(400).json({message: 'Invalid request body'});

        const parsedExpirationHours = expirationHours !== undefined && expirationHours !== null 
            ? parseInt(String(expirationHours), 10) 
            : 78;
        
        const finalExpirationHours = !isNaN(parsedExpirationHours) && parsedExpirationHours > 0 
            ? parsedExpirationHours 
            : 78;

        const uploadData = {
			userId: req.user.id,
			expirationHours: finalExpirationHours,
			fileName: fileName || 'Untitled',
			fileType: (fileType as FileType) || 'txt',
			fileBuffer: req.body,
		};
        const result = await fileService.uploadFile(uploadData);
        res.status(201).json({
            message: "File uploaded successfully",
            ...result,
        });
    }
    catch(error){
        console.error('Upload error:', error);
        res.status(500).json({message: 'File upload failed', error});
    };
};

export const getFile = async(req: Request, res: Response)=>{
    try{
        const {fileId} = req.params;
        const result = await fileService.getFileForDisplay(fileId || '');

        if(!result) return res.status(404).json({message: 'File not found'});

        const {file, presignedUrl} = result;
        const expirationTime = new Date(file.createdAt.getTime() + file.expirationHours * 60 * 60 * 1000);

        res.json({

            file:{
                id: file.id,
                name: file.name,
                fileType: file.fileType,
                createdAt: file.createdAt,
                expirationTime,
            },
            presignedUrl,
        });
    }
    catch (error) {
        console.error('Get file error:', error);
        if (error instanceof Error && error.message === 'File has expired') {
            return res.status(410).json({ message: 'File has expired' });
        }
        res.status(500).json({ message: 'Error retrieving file', error: (error as Error).message });
    }    
};

export const getExpiredFileKeys = async (req: Request, res: Response) => {
    try {
      const expiredFiles = await findExpiredFiles();
      const result = expiredFiles.map(file => ({
        id: file.id,
        s3Key: file.s3Key,
      }));
      return res.json({ files: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  };

export const getUserFiles = async(req: AuthRequest, res: Response)=>{
    try{
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
        
        const files = await findFilesByUserId(req.user.id);
        
        // Filter out expired files
        const now = new Date();
        const validFiles = files.filter(file => {
            const expirationDate = new Date(
                file.createdAt.getTime() + file.expirationHours * 60 * 60 * 1000
            );
            return now <= expirationDate;
        });
        
        // Generate presigned URLs for all valid files
        const filesWithPresignedUrls = await Promise.all(
            validFiles.map(async (file) => {
                const presignedUrl = await s3Service.getFileUrl(file.s3Key);
                return {
                    id: file.id,
                    name: file.name,
                    fileType: file.fileType,
                    createdAt: file.createdAt,
                    expirationTime: new Date(file.createdAt.getTime() + file.expirationHours * 60 * 60 * 1000),
                    presignedUrl,
                };
            })
        );
        
        res.json({
            files: filesWithPresignedUrls,
            count: filesWithPresignedUrls.length
        });
    }
    catch(error){
        console.error('Get user files error:', error);
        res.status(500).json({message: 'Error retrieving user files', error});
    }
};

export const deleteExpiredFilesApi = async (req: Request, res: Response) => {
    try {
      const deletedCount = await deleteExpiredFiles();
      return res.json({ deletedCount });
    } catch (err) {
      return res.status(500).json({ error: "Deletion failed" });
    }
  };
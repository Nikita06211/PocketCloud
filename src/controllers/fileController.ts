import type {Request, Response} from 'express';
import {fileService} from '../services/fileService';
import { FileType } from '../entities/File';
import type { AuthRequest } from '../middleware/auth';
export const uploadFile = async(req: AuthRequest, res: Response)=>{
    try{
        
        const { expirationHours, fileName, fileType} = req.query as unknown as { expirationHours: number, fileName: string, fileType: FileType};
        console.log('controller hit, user:', (req as any).user);
        if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
        if(!req.body || !Buffer.isBuffer(req.body)) return res.status(400).json({message: 'Invalid request body'});

        const uploadData = {
			userId: req.user.id,
			expirationHours: parseInt(String(expirationHours ?? '')) || 78,
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
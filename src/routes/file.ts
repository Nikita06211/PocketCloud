import { Router } from 'express';
import { uploadFile, getFile, cleanupExpiredFiles } from '../controllers/fileController';
import { auth } from '../middleware/auth';
import express from 'express';

const router = Router();

router.post('/upload', auth, express.raw({ type: '*/*', limit: '10mb' }), uploadFile);
router.get('/files/:fileId', getFile);
router.get('/cleanup', cleanupExpiredFiles);
export default router;
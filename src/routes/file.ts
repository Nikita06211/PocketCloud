import { Router } from 'express';
import { uploadFile, getFile, getUserFiles, getExpiredFileKeys, deleteExpiredFilesApi } from '../controllers/fileController';
import { auth } from '../middleware/auth';
import express from 'express';

const router = Router();

router.post('/upload', auth, express.raw({ type: '*/*', limit: '10mb' }), uploadFile);
router.get('/files/:fileId', getFile);
router.get('/files', auth, getUserFiles);
router.get("/files/expired-keys", auth, getExpiredFileKeys);
router.delete("/expired", deleteExpiredFilesApi);



export default router;
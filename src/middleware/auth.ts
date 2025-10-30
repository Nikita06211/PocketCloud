import type {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request{
    user?: {id:number};
}

export function auth(req: AuthRequest, res: Response, next: NextFunction){
    try{
        console.log('auth hit, header:', req.headers.authorization);
        const header = (req.headers.authorization as string) || (req.headers as any).Authorization || '';
        const parts = header.trim().split(/\s+/);
        const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;
        if(!token) return res.status(401).json({message: 'Missing or malformed Authorization header'});
        const payload = jwt.verify(token, JWT_SECRET) as {userId: number};
        if(!payload?.userId) return res.status(401).json({message: 'Invalid Token'});

        req.user = {id: payload.userId};
        next();
    } catch(err){
        console.error('Authentication error:', err);
        return res.status(401).json({message: 'Unauthorized', error: err});
    }
}

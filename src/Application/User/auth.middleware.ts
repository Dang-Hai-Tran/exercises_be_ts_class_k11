import { Request, Response, NextFunction } from 'express';
import { Response as MyResponse } from '../../Domain/response';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.userId) {
        next()
    } else {
        res.status(401).json(new MyResponse('Unauthorized', 'error', 401))
    }
}

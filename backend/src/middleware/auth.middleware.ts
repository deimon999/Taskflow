import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { CustomError } from './error.middleware';

export interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                const error = new Error('User not found') as CustomError;
                error.statusCode = 401;
                return next(error);
            }

            next();
        } catch (err) {
            console.error(err);
            const error = new Error('Not authorized, token failed') as CustomError;
            error.statusCode = 401;
            return next(error);
        }
    } else {
        const error = new Error('Not authorized, no token') as CustomError;
        error.statusCode = 401;
        return next(error);
    }
};

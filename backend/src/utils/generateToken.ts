import jwt from 'jsonwebtoken';
import { Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const generateToken = (res: Response, userId: string) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        // Production: secure + sameSite=none required for cross-origin (Render → Vercel)
        // Development: secure=false + sameSite=strict for localhost
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour in ms
    });
};

export default generateToken;

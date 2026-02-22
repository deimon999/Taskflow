import jwt from 'jsonwebtoken';
import { Response } from 'express';

const generateToken = (res: Response, userId: string) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });
};

export default generateToken;

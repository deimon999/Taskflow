import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CustomError } from './error.middleware';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const fieldErrors: Record<string, string> = {};
        errors.array().forEach((err: any) => {
            if (err.type === 'field' && err.path && err.msg) {
                // If a field error already exists, keep the first one or append (choosing to keep first for simplicity)
                if (!fieldErrors[err.path]) {
                    fieldErrors[err.path] = err.msg;
                }
            }
        });

        const error = new Error('Validation Error') as CustomError;
        error.statusCode = 400;
        error.fieldErrors = fieldErrors;
        return next(error);
    }
    next();
};

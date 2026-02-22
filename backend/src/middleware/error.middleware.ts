import { Request, Response, NextFunction } from 'express';

// Standard Error Object Format requested by User (message and fieldErrors)
export interface CustomError extends Error {
    statusCode?: number;
    fieldErrors?: Record<string, string>;
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Determine status code (default to 500 if not set, or if it's 200 indicating an error occurred but status wasn't changed)
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

    // Check if it's a Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const fieldErrors: Record<string, string> = {};
        // @ts-ignore - Assuming Mongoose Validation Error structure
        for (const field in (err as any).errors) {
            fieldErrors[field] = (err as any).errors[field].message;
        }
        res.status(400).json({
            message: 'Validation Error',
            fieldErrors
        });
        return;
    }

    // Check if it's a Mongoose Cast Error (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({
            message: 'Resource not found',
        });
        return;
    }

    // Default error response formatting
    const errorResponse: any = {
        message: err.message || 'Internal Server Error'
    };

    // Add fieldErrors if present (e.g., from express-validator)
    if (err.fieldErrors) {
        errorResponse.fieldErrors = err.fieldErrors;
    }

    res.status(statusCode).json(errorResponse);
};

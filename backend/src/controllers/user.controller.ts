import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { CustomError } from '../middleware/error.middleware';

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            const error = new Error('User not found') as CustomError;
            error.statusCode = 404;
            return next(error);
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
            });
        } else {
            const error = new Error('User not found') as CustomError;
            error.statusCode = 404;
            return next(error);
        }
    } catch (err) {
        // Handle unique email error
        if ((err as any).code === 11000) {
            const error = new Error('Email already in use') as CustomError;
            error.statusCode = 400;
            error.fieldErrors = { email: "Email already in use" };
            return next(error);
        }
        next(err);
    }
};

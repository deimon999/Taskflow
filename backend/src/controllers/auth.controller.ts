import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { CustomError } from '../middleware/error.middleware';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            const error = new Error('User already exists') as CustomError;
            error.statusCode = 400;
            // The user expectation is for "fieldErrors" to map to fields if available
            error.fieldErrors = { email: "User already exists with this email" };
            return next(error);
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            generateToken(res, user.id);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            const error = new Error('Invalid user data') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Fetch user with password
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            generateToken(res, user.id);

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            const error = new Error('Invalid email or password') as CustomError;
            error.statusCode = 401;
            return next(error);
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

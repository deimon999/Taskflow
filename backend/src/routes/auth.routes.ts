import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post(
    '/register',
    authLimiter,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Please enter a password with 6 or more characters'),
        validateRequest
    ],
    registerUser
);

router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').exists().withMessage('Password is required'),
        validateRequest
    ],
    loginUser
);

router.post('/logout', logoutUser);

export default router;

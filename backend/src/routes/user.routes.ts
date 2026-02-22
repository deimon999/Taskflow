import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/me')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;

import express from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/task.controller';
import { protect } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';

const router = express.Router();

router.use(protect); // All task routes are protected

router.route('/')
    .post(
        [
            body('title').notEmpty().withMessage('Title is required'),
            validateRequest
        ],
        createTask
    )
    .get(getTasks);

router.route('/:id')
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask);

export default router;

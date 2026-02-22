import { Response, NextFunction } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth.middleware';
import { CustomError } from '../middleware/error.middleware';

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, status, dueDate } = req.body;

        const task = await Task.create({
            user: req.user._id,
            title,
            description,
            status: status || 'todo',
            dueDate
        });

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { status, search, sort, page = '1', limit = '10' } = req.query;

        // Build query
        const query: any = { user: req.user._id };

        // Filtering
        if (status) {
            query.status = status;
        }

        // Searching
        if (search) {
            query.$text = { $search: search as string };
        }

        // Pagination
        const pageNum = parseInt(page as string, 10) || 1;
        const limitNum = parseInt(limit as string, 10) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        let sortOption: any = { createdAt: -1 }; // default descending
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'dueDate') {
            sortOption = { dueDate: 1 };
        } else if (search) {
            // Sort by text search score if searching
            sortOption = { score: { $meta: 'textScore' } };
        }

        const tasks = await Task.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Task.countDocuments(query);

        res.json({
            tasks,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            const error = new Error('Task not found') as CustomError;
            error.statusCode = 404;
            return next(error);
        }

        // Verify ownership
        if (task.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to access this task') as CustomError;
            error.statusCode = 403;
            return next(error);
        }

        res.json(task);
    } catch (err) {
        next(err);
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            const error = new Error('Task not found') as CustomError;
            error.statusCode = 404;
            return next(error);
        }

        // Verify ownership
        if (task.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to update this task') as CustomError;
            error.statusCode = 403;
            return next(error);
        }

        task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(task);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            const error = new Error('Task not found') as CustomError;
            error.statusCode = 404;
            return next(error);
        }

        // Verify ownership
        if (task.user.toString() !== req.user._id.toString()) {
            const error = new Error('Not authorized to delete this task') as CustomError;
            error.statusCode = 403;
            return next(error);
        }

        // Using deleteOne
        await Task.deleteOne({ _id: req.params.id });

        res.json({ message: 'Task removed' });
    } catch (err) {
        next(err);
    }
};

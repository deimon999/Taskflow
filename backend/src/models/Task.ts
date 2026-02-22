import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
            maxlength: [100, 'Title can not be more than 100 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description can not be more than 500 characters']
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo'
        },
        dueDate: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
);

// Indexing for performance
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ITask>('Task', TaskSchema);

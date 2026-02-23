import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // MONGO_URI for production (Render), MONGODB_URI for local dev
        const uri = (process.env.MONGO_URI || process.env.MONGODB_URI) as string;
        const conn = await mongoose.connect(uri, {
            maxPoolSize: 10, // Connection pooling for scalability
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;

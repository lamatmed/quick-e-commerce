import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger le fichier .env
dotenv.config();

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    console.log("MongoDB URI:", process.env.MONGODB_URI); // Vérifiez si l'URI est correcte
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = { bufferCommands: false };
        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/quickcart`, opts).then(mongoose => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
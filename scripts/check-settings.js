
import mongoose from 'mongoose';
import { Settings } from './models/Settings.ts'; // This might not work directly with ts-node without config
import dotenv from 'dotenv';
import path from 'path';

// Manual connection check
async function checkDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not found");
        return;
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
        
        const settings = await mongoose.connection.db.collection('settings').findOne({ type: 'global' });
        console.log("Global Settings in DB:", JSON.stringify(settings, null, 2));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("DB Error:", err);
    }
}

// Since I can't easily run TS with models here, let's just use raw mongo
checkDB();

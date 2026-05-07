
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function checkDB() {
    // Try to find env from .env or .env.local
    let uri = process.env.MONGODB_URI;
    
    if (!uri) {
        try {
            const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
            const match = envContent.match(/MONGODB_URI=(.+)/);
            if (match) uri = match[1].trim();
        } catch (e) {}
    }

    if (!uri) {
        console.error("MONGODB_URI not found");
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        
        const db = client.db();
        const settings = await db.collection('settings').findOne({ type: 'global' });
        console.log("Global Settings in DB:", JSON.stringify(settings, null, 2));
        
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await client.close();
    }
}

checkDB();

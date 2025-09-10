// Simple Express server with Google Cloud Storage integration
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
require('dotenv').config();

const app = express();
const port = 3001;

// --- CONFIGURATION ---
const DB_PATH = './videos.json';

app.use(cors());
app.use(express.json());

// Configure Google Cloud Storage
// This will automatically use the GOOGLE_APPLICATION_CREDENTIALS environment variable
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// --- DATABASE HELPERS ---
const readDB = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};

const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

// --- API ROUTES ---

// 1. Get a presigned URL for uploading a file
app.post('/api/generate-upload-url', async (req, res) => {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
        return res.status(400).json({ message: 'fileName and fileType are required' });
    }

    const fileKey = `uploads/${uuidv4()}-${fileName}`;
    const file = bucket.file(fileKey);

    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: fileType,
    };

    try {
        const [uploadUrl] = await file.getSignedUrl(options);
        res.json({ uploadUrl, fileKey });
    } catch (error) {
        console.error('Error generating presigned URL', error);
        res.status(500).json({ message: 'Could not generate upload URL' });
    }
});

// 2. Confirm upload and save metadata
app.post('/api/upload-complete', async (req, res) => {
    const { fileKey, fileName, fileType, title, description } = req.body;
    
    // Public URL for a GCS object
    const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileKey}`;

    const newVideo = {
        id: uuidv4(),
        type: 'uploaded',
        title,
        description,
        publicUrl,
        fileKey,
        fileName,
        fileType,
        uploadedAt: new Date().toISOString(),
    };

    try {
        const videos = await readDB();
        videos.push(newVideo);
        await writeDB(videos);
        res.status(201).json(newVideo);
    } catch (error) {
        console.error('Error saving video metadata', error);
        res.status(500).json({ message: 'Error saving video information' });
    }
});

// 3. Get all uploaded videos
app.get('/api/my-videos', async (req, res) => {
    try {
        const videos = await readDB();
        res.json(videos);
    } catch (error) {
        console.error('Error reading video database', error);
        res.status(500).json({ message: 'Could not retrieve videos' });
    }
});

// 4. Delete a video
app.delete('/api/videos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const videos = await readDB();
        const videoToDelete = videos.find(v => v.id === id);

        if (!videoToDelete) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Delete from GCS
        await bucket.file(videoToDelete.fileKey).delete();

        // Delete from DB
        const updatedVideos = videos.filter(v => v.id !== id);
        await writeDB(updatedVideos);

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

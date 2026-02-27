import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many debate requests. Please wait a moment.' }
});

app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

const apiKey = process.env.VITE_GEMINI_API_KEY || '';
console.log('API Key loaded:', apiKey ? apiKey.substring(0, 4) + '...' : 'MISSING');
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

import fs from 'fs-extra';
import path from 'path';

const REVIEWS_FILE = path.join(process.cwd(), 'reviews.json');

// Ensure reviews file exists
if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeJsonSync(REVIEWS_FILE, []);
}

app.post('/api/reviews', async (req, res) => {
    const { name, rating, comment } = req.body;
    if (!name || !rating) return res.status(400).json({ error: 'Name and Rating are required' });

    try {
        const reviews = await fs.readJson(REVIEWS_FILE);
        const newReview = { name, rating, comment, date: new Date().toISOString() };
        reviews.push(newReview);
        await fs.writeJson(REVIEWS_FILE, reviews);
        res.json({ success: true, review: newReview });
    } catch (error) {
        console.error('Review Save Error:', error);
        res.status(500).json({ error: 'Failed to save review' });
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await fs.readJson(REVIEWS_FILE);
        res.json(reviews);
    } catch (error) {
        console.error('Review Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.post('/api/debate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n====== RAW GEMINI AI RESPONSE ======");
        console.log(text);
        console.log("====================================\n");

        res.json({ text });
    } catch (error) {
        console.error('Gemini Proxy Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate debate response' });
    }
});

app.listen(port, () => {
    console.log(`Debate Proxy Server running at http://localhost:${port}`);
});

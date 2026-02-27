import Redis from 'ioredis';

// Initialize Redis only if the URL is provided
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
const REVIEWS_KEY = 'yapperbot_reviews';

export default async function handler(req, res) {
    // Check if Redis is configured
    if (!redis) {
        console.warn('REDIS_URL is not set. Using mock review system.');
        if (req.method === 'POST') {
            return res.status(200).json({ success: true, mocked: true });
        }
        return res.status(200).json([]); // Return empty array if no DB
    }

    try {
        if (req.method === 'GET') {
            // Fetch reviews from Redis
            const data = await redis.get(REVIEWS_KEY);
            const reviews = data ? JSON.parse(data) : [];
            return res.status(200).json(reviews);
        }

        if (req.method === 'POST') {
            const { name, rating, comment } = req.body;
            if (!name || !rating) {
                return res.status(400).json({ error: 'Name and Rating are required' });
            }

            // Fetch current, push new, save back to Redis
            const data = await redis.get(REVIEWS_KEY);
            const reviews = data ? JSON.parse(data) : [];

            const newReview = { name, rating, comment, date: new Date().toISOString() };
            reviews.push(newReview);

            await redis.set(REVIEWS_KEY, JSON.stringify(reviews));

            return res.status(200).json({ success: true, review: newReview });
        }

        // Method not allowed for anything other than GET or POST
        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Redis Review Error:', error);
        return res.status(500).json({ error: 'Database connection failed' });
    }
}

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

async function test() {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    console.log("Checking model generation for key:", apiKey.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    try {
        const result = await model.generateContent("Say hello");
        console.log(result.response.text());
    } catch (e) {
        console.error(e);
    }
}

test();

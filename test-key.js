import dotenv from 'dotenv';
dotenv.config();
const key = process.env.VITE_GEMINI_API_KEY;
console.log("Checking models for key:", key.substring(0, 5) + "...");
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("API Error:", data.error);
        } else if (data.models) {
            console.log("Available generation models:");
            data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .forEach(m => console.log(m.name));
        } else {
            console.log("Unknown response:", data);
        }
    })
    .catch(console.error);

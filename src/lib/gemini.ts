export const generateDebateResponse = async (prompt: string, maxRetries = 3) => {
    let retries = 0;

    while (retries <= maxRetries) {
        try {
            const response = await fetch('/api/debate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `HTTP Error ${response.status}`;

                // Identify rate limit based on status or error message
                const isRateLimit = response.status === 429 ||
                    errorMessage.toLowerCase().includes('429') ||
                    errorMessage.toLowerCase().includes('quota') ||
                    errorMessage.toLowerCase().includes('too many requests');

                if (isRateLimit && retries < maxRetries) {
                    // Exponential backoff with jitter: 2s, 4s, 8s...
                    const delay = Math.pow(2, retries) * 2000 + (Math.random() * 500);
                    console.warn(`Rate limited (429). Retrying in ${Math.round(delay)}ms...`);
                    await new Promise(r => setTimeout(r, delay));
                    retries++;
                    continue;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error(`Attempt ${retries + 1} failed:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);

            // If we have retries left, treat it as a retriable fetch/network error
            if (retries < maxRetries) {
                const delay = Math.pow(2, retries) * 2000 + (Math.random() * 500);
                console.warn(`API/Network error. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(r => setTimeout(r, delay));
                retries++;
                continue;
            }

            // Out of retries
            if (errorMessage.toLowerCase().includes('429') ||
                errorMessage.toLowerCase().includes('quota') ||
                errorMessage.toLowerCase().includes('too many requests')) {
                return "I'm thinking too fast! The API is rate-limiting me (429 Error). Please wait a moment before continuing.";
            }

            return `I'm having trouble thinking of a rebuttal right now... (${errorMessage})`;
        }
    }

    return "I'm having trouble thinking of a rebuttal right now... (Max retries exceeded)";
};

// Internal model access is now deprecated in frontend for security
export const geminiModel = {
    generateContent: async (prompt: string) => {
        const text = await generateDebateResponse(prompt);
        return {
            response: {
                text: () => text
            }
        };
    }
};

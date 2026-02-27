export const generateDebateResponse = async (prompt: string) => {
    try {
        const response = await fetch('/api/debate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate response');
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Error generating debate response:", error);
        return "I'm having trouble thinking of a rebuttal right now...";
    }
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

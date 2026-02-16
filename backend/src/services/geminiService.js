const fs = require('fs');

async function scrapeWithGemini(filePath, type = 'question_paper') {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');

    let prompt = "";
    if (type === 'question_paper') {
        prompt = `
            Extract all questions from the attached question paper PDF. 
            Return the output as a clean JSON array of objects.
            Each object should have:
            - question_no (string)
            - question_text (string)
            - max_marks (number)
            - question_type (string, e.g., 'subjective', 'objective')

            Important: Return ONLY the JSON array.
        `;
    } else {
        prompt = `
            Extract the answer key/model answers from the attached PDF.
            Return the output as a clean JSON array of objects.
            Each object should correspond to a question and include:
            - question_no (string)
            - correct_answer (string)
            - points (array of strings representing key evaluation points)

            Important: Return ONLY the JSON array.
        `;
    }

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: "application/pdf",
                        data: base64File
                    }
                }
            ]
        }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    async function fetchWithRetry(url, options, maxRetries = 3, initialDelay = 2000) {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                const response = await fetch(url, options);
                const result = await response.json();

                if (response.status === 429) {
                    console.warn(`Gemini API 429: Resource exhausted. Retrying in ${initialDelay * Math.pow(2, retries)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, retries)));
                    retries++;
                    continue;
                }

                if (!response.ok) {
                    if (result.error) {
                        throw new Error(`Gemini API Error: ${result.error.message || 'Unknown error'}`);
                    }
                    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
                }

                return result;
            } catch (error) {
                if (retries === maxRetries - 1) throw error;
                console.warn(`Retry ${retries + 1} failed: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, retries)));
                retries++;
            }
        }
        throw new Error(`Gemini API failed after ${maxRetries} retries due to rate limiting or other issues.`);
    }

    try {
        const result = await fetchWithRetry(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!result.candidates || !result.candidates[0].content) {
            console.error('Gemini API Full Error Response:', JSON.stringify(result, null, 2));
            throw new Error('Failed to get valid response from Gemini (No candidates)');
        }

        const textResponse = result.candidates[0].content.parts[0].text;
        return JSON.parse(textResponse);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

module.exports = {
    scrapeWithGemini
};

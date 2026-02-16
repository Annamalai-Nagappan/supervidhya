const fs = require('fs');

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
    throw new Error(`Gemini API failed after ${maxRetries} retries.`);
}

async function scrapeWithGemini(filePath, type = 'question_paper', expectedQuestions = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');

    const questionHint = expectedQuestions.length > 0
        ? `Use these specific question numbers for mapping: ${expectedQuestions.join(', ')}.`
        : '';

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
    } else if (type === 'model_answer') {
        prompt = `
            Extract the answer key/model answers from the attached PDF.
            Return the output as a clean JSON array of objects.
            Each object should correspond to a question and include:
            - question_no (string)
            - correct_answer (string)
            - points (array of strings representing key evaluation points)

            ${questionHint}
            Important: Return ONLY the JSON array. Ensure the question_no matches the question paper exactly.
        `;
    } else if (type === 'student_submission') {
        prompt = `
            Extract the student's handwritten or typed answers from the attached PDF.
            Return the output as a clean JSON array of objects.
            Each object should correspond to a question and include:
            - question_no (string)
            - student_answer (string)

            ${questionHint}
            Important: Return ONLY the JSON array. Map the student's answers to the provided question numbers even if they just wrote "1", "2", etc.
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

    try {
        const result = await fetchWithRetry(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!result.candidates || !result.candidates[0].content) {
            console.error('Gemini API Error:', result);
            throw new Error('Failed to get valid response from Gemini');
        }

        const textResponse = result.candidates[0].content.parts[0].text;
        return JSON.parse(textResponse);
    } catch (error) {
        console.error('Error in scrapeWithGemini:', error);
        throw error;
    }
}

async function evaluateStudentAnswer(questionText, modelAnswer, keyPoints, studentAnswer, maxMarks) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(modelAnswer);
    console.log("--------------------------~~~~~~~~~~~~~~~~~~~~~~~----")
    console.log(keyPoints);
    console.log("----------------------------~~~~~~~~~~~~~~~~~~~~~~--")
    console.log(studentAnswer);
    console.log("--------------------------------------------------")
    console.log(maxMarks);
    console.log("----------------------------------------------------")

    const prompt = `
        You are an expert examiner. Evaluate the student's answer based on the following:

        Question: ${questionText}
        Model Answer: ${modelAnswer}
        Key Evaluation Points: ${JSON.stringify(keyPoints)}
        Maximum Marks: ${maxMarks}

        Student's Answer: "${studentAnswer}"

        Tasks:
        1. Compare the student's answer with the model answer and key points.
        2. Assign a numeric score (out of ${maxMarks}).
        3. Provide specific feedback on what they got right and what's missing.
        4. Rate the match quality (e.g., 'Excellent', 'Good', 'Average', 'Poor').

        Return the result as a clean JSON object with precisely these keys:
        - score (number)
        - feedback (string)
        - match_quality (string)
        - confidence_score (number between 0 and 1)

        Return ONLY the JSON.
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    };

    try {
        const result = await fetchWithRetry(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!result.candidates || !result.candidates[0].content) {
            throw new Error('AI Evaluation failed');
        }

        return JSON.parse(result.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error('Error in evaluateStudentAnswer:', error);
        throw error;
    }
}

module.exports = {
    scrapeWithGemini,
    evaluateStudentAnswer
};

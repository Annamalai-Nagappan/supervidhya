require("dotenv").config();
const fs = require("fs");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();

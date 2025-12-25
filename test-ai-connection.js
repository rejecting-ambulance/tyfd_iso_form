
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Manually read .env.local
const envPath = path.resolve(__dirname, '.env.local');
let apiKey = '';

console.log(`Checking for .env.local at: ${envPath}`);


if (fs.existsSync(envPath)) {
    console.log("File exists.");
    const content = fs.readFileSync(envPath, 'utf8');
    console.log(`File content length: ${content.length}`);



    // Try more flexible parsing
    let lines = content.split(/\r?\n/);

    // Helper to parse lines
    const findKey = (linesList) => {
        for (const line of linesList) {
            // Remove null bytes if any (common in bad encoding reads)
            const cleanLine = line.replace(/\0/g, '');
            if (cleanLine.includes('GEMINI_API_KEY')) {
                const parts = cleanLine.split('=');
                if (parts.length >= 2) {
                    let val = parts.slice(1).join('=').trim();
                    val = val.replace(/^["'](.*)["']$/, '$1');
                    return val;
                }
            }
        }
        return null;
    };

    apiKey = findKey(lines);

    if (!apiKey) {
        console.log("Key not found in UTF-8 mode. Trying UTF-16LE...");
        const content16 = fs.readFileSync(envPath, 'utf16le');
        lines = content16.split(/\r?\n/);
        apiKey = findKey(lines);
    }

    if (apiKey) {
        console.log("Found API Key (first 5 chars):", apiKey.substring(0, 5) + "...");
    } else {
        console.log("GEMINI_API_KEY not found in .env.local content (tried UTF-8 and UTF-16LE).");
    }
} else {

    console.log(".env.local file not found.");
}

if (!apiKey) {
    console.error("❌ Error: No API Key found. Please check .env.local");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey });

async function testConnection() {
    console.log("Testing Gemini API connection...");
    try {
        // Note: The SDK usage in geminiService.ts is:
        // aiClient.models.generateContent({ model: ..., contents: ... })
        // Let's match that.

        const response = await client.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: {
                parts: [{ text: "Hello, just say 'AI IS WORKING' and nothing else." }]
            }
        });

        const text = response.text;
        console.log("AI Response:", text);

        if (text && text.includes("WORKING")) {
            console.log("✅ AI Functionality Check: PASSED");
        } else {
            console.log("⚠️ AI Functionality Check: RESPONSE RECEIVED BUT UNEXPECTED CONTENT");
        }

    } catch (error) {
        console.error("❌ AI Functionality Check: FAILED");
        console.error("Error details:", error);
    }
}

testConnection();

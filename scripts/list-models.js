
import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

async function list() {
    process.env.HTTP_PROXY = ''; // Clear proxy if any
    process.env.HTTPS_PROXY = '';

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No Key");
        return;
    }

    // Direct fetch to list models to avoid SDK opacity if needed, 
    // but SDK should work if key is valid.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        console.log("Fetching models...");
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.error("❌ No models found or error:", data);
        }
    } catch (e) {
        console.error("Failed to list models:", e);
    }
}

list();

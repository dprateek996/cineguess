
import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

async function test() {
    console.log("Testing Gemini API...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No GEMINI_API_KEY found!");
        return;
    }
    console.log(`Key found (starts with: ${key.substring(0, 4)}...)`);

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        const prompt = "Explain the plot of the movie 'Inception' in one sentence.";
        console.log(`Sending prompt: "${prompt}"`);

        const result = await model.generateContent(prompt);
        console.log("Response received!");
        console.log(result.response.text());
        console.log("✅ API is working.");
    } catch (error) {
        console.error("❌ API Failed:");
        console.error(error);
    }
}

test();

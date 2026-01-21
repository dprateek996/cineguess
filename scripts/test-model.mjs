
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function main() {
    try {
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try or just try usage.
        // Actually, the SDK doesn't always expose listModels easily without model manager.
        // Let's just try to hit the API directly via fetch if needed, 
        // but for now let's just try a simple generation with 'gemini-1.5-flash-001' to valid.

        const modelName = 'gemini-flash-latest'
        console.log(`Testing ${modelName}...`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Say hello')
        console.log(`Success! Response: ${result.response.text()}`)
    } catch (e) {
        console.error('Error:', e.message)
    }
}

main()

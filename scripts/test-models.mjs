
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function main() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' }) // Just to init? No, need request.
        // Actually, there is listModels on the client or similar?
        // Looking at docs, usually it's a separate call or not exposed in all SDK versions easily without admin.
        // But let's try a simple generation with 'gemini-pro' to see if it works.
        console.log('Trying gemini-pro...')
        const m = genAI.getGenerativeModel({ model: 'gemini-pro' })
        const result = await m.generateContent('Hello')
        console.log('gemini-pro success:', result.response.text())
    } catch (e) {
        console.error('gemini-pro failed:', e.message)
    }

    try {
        console.log('Trying gemini-1.5-flash-latest...')
        const m = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
        const result = await m.generateContent('Hello')
        console.log('gemini-1.5-flash-latest success:', result.response.text())
    } catch (e) {
        console.error('gemini-1.5-flash-latest failed:', e.message)
    }
}

main()

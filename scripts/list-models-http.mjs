
import dotenv from 'dotenv'
dotenv.config()

async function main() {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
        console.error('No API Key')
        return
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.models) {
            console.log('Available models:')
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`))
        } else {
            console.error('No models found', data)
        }
    } catch (e) {
        console.error('Fetch failed:', e)
    }
}
main()

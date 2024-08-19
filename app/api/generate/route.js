import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;

const systemPrompt = `You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given input. Follow these guidelines:
1. Create a question on one side and the corresponding answer on the other.
2. Keep questions clear, specific, and focused on a single concept.
3. Ensure answers are brief but comprehensive.
4. Use simple language to enhance understanding and retention.
5. For factual information, include key dates, names, or terms.
6. For concepts, focus on definitions, explanations, or examples.
7. Avoid overly complex or lengthy content on a single flashcard.
8. If appropriate, use mnemonic devices or memory aids.
9. Organize related flashcards into sets or categories when possible.
10. Aim to create flashcards that promote active recall and critical thinking.
11. Generate 10 flashcards.
12. Format your response as a JSON array of objects, each with 'front' and 'back' properties.`;

export async function POST(req) {
    if (!API_KEY) {
        console.error('API key not configured');
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
        const data = await req.text();

        // Combine system prompt and user input
        const prompt = `${systemPrompt}\n\nUser input: ${data}`;

        // Generate content using the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let completion = response.text();

        // Clean up the response
        completion = completion.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        completion = completion.trim();

        // Additional cleanup: ensure the string starts and ends with square brackets
        if (!completion.startsWith('[')) completion = '[' + completion;
        if (!completion.endsWith(']')) completion = completion + ']';

        // Attempt to parse JSON, with error handling
        let flashcards;
        try {
            flashcards = JSON.parse(completion);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.log('Raw completion:', completion);
            return NextResponse.json({ 
                error: 'Invalid JSON response from API', 
                details: parseError.message 
            }, { status: 500 });
        }

        if (!Array.isArray(flashcards)) {
            throw new Error('API response is not an array of flashcards');
        }

        return NextResponse.json(flashcards);

    } catch (error) {
        console.error('Gemini API error:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error.message
        }, { status: 500 });
    }
}
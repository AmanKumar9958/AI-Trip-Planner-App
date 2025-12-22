import OpenAI from "openai";

// 1. Setup Groq Client
const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!apiKey) {
  console.error("Error: EXPO_PUBLIC_GROQ_API_KEY is not set. Please check your .env file.");
}

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.groq.com/openai/v1", // Using Groq's endpoint
  dangerouslyAllowBrowser: true, // Required for React Native / Expo
});

// Best model for complex JSON tasks (Free Tier: ~1,000 requests/day)
// If you need more volume, switch to: "llama-3.1-8b-instant"
const MODEL_NAME = "llama-3.3-70b-versatile"; 

/**
 * Generates a response from AI.
 * Keeps the same function signature as your old code: (prompt, config)
 * although we ignore 'config' here since Groq handles it differently.
 */
export async function generateAIResponse(prompt, config = {}) {
  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant. Provide response in plain text." },
        { role: "user", content: prompt }
      ],
      model: MODEL_NAME,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq AI Error (generateAIResponse):", error);
    throw error;
  }
}

/**
 * Mocks the Google Gemini 'chatSession' object.
 * This ensures you don't have to change code in 'mytrip.jsx' or 'home.jsx'.
 */
export const chatSession = {
  sendMessage: async (prompt) => {
    try {
      // We send the System Prompt here to enforce strict JSON
      const completion = await client.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a travel assistant. You must return only strict JSON. Do not use markdown (```json). Do not add any conversational text." 
          },
          { role: "user", content: prompt }
        ],
        model: MODEL_NAME,
        temperature: 1,
        // response_format: { type: "json_object" } // Uncomment if you want to force JSON mode (strictly)
      });

      const resultText = completion.choices[0]?.message?.content || "";

      // Return the exact structure your app expects from Gemini
      return {
        response: {
          text: () => resultText
        }
      };
    } catch (error) {
      console.error("Groq AI Error (chatSession):", error);
      throw error;
    }
  }
};
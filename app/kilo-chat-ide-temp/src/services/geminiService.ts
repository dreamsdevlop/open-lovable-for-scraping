import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

export async function sendMessageToGeminiStream(
  messages: Message[],
  onChunk: (chunk: string) => void
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing.");
  }

  const genAI = new GoogleGenAI({ apiKey });
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));
  
  const lastMessage = messages[messages.length - 1].content;

  const response = await genAI.models.generateContentStream({
    model: "gemini-2.0-flash-exp",
    contents: [...history, { role: 'user', parts: [{ text: lastMessage }] }]
  });

  let fullContent = '';
  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      fullContent += text;
      onChunk(text);
    }
  }

  return fullContent || "No response from Gemini.";
}

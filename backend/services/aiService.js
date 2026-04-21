const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const generateAIResponse = async (prompt) => {
  try {

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an AI tutor that explains concepts clearly for students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error("AI generation failed");
  }
};

module.exports = { generateAIResponse };
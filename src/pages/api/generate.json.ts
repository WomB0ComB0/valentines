import { Groq } from 'groq-sdk';
import type { APIRoute } from "astro";

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log("Received POST request");
    const data = await request.json();
    console.log("Request data:", data);
    
    const { recipient, relationship, tone, details } = data;

    const prompt = `Write a ${tone} love letter to my ${relationship} named ${recipient}. ${
      details ? `Include these details: ${details}` : ''
    }`;
    console.log("Generated prompt:", prompt);

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
    });
    console.log("Received completion from Groq");

    const response = {
      letter: completion.choices[0].message.content,
    };
    console.log("Sending response:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    const errorResponse = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
    console.error("Error response:", errorResponse);
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
import OpenAI from 'openai';
import type { APIRoute } from "astro";

console.info(process.env.OPENAI_API_KEY)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const { recipient, relationship, tone, details } = await request.json();

  const prompt = `Write a ${tone} love letter to my ${relationship} named ${recipient}. ${
    details ? `Include these details: ${details}` : ''
  }`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: '',
  });

  return new Response(JSON.stringify({
    letter: completion.choices[0].message.content,
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
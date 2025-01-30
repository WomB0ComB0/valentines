import { Groq } from 'groq-sdk';
import type { APIRoute } from "astro";

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const { recipient, relationship, tone, details } = await request.json();

  const prompt = `Write a ${tone} love letter to my ${relationship} named ${recipient}. ${
    details ? `Include these details: ${details}` : ''
  }`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
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
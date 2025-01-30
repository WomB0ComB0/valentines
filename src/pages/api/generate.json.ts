import { Groq } from 'groq-sdk';
import type { APIRoute } from "astro";

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const recipient = formData.get('recipient') as string;
    const relationship = formData.get('relationship') as string;
    const tone = formData.get('tone') as string;
    const details = formData.get('details') as string;

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
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
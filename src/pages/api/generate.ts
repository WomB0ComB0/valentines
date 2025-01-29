import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function post({ request }) {
  const { recipient, relationship, tone, details } = await request.json();

  const prompt = `Write a ${tone} love letter to my ${relationship} named ${recipient}. ${
    details ? `Include these details: ${details}` : ''
  }`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
  });

  return {
    body: {
      letter: completion.choices[0].message.content,
    },
  };
}
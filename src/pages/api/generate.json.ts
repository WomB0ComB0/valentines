import { Groq } from 'groq-sdk';
import type { APIRoute } from "astro";
import { z } from 'zod';
import { withRateLimit } from '@/lib/rate-limiter';

const RequestSchema = z.object({
  recipient: z.string().min(1, "Recipient name is required").max(50, "Recipient name too long"),
  relationship: z.enum(["partner", "crush", "spouse"], {
    errorMap: () => ({ message: "Invalid relationship type" })
  }),
  tone: z.enum(["romantic", "playful", "poetic"], {
    errorMap: () => ({ message: "Invalid tone selection" })
  }),
  details: z.string().max(500, "Details too long").optional()
});

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

const safetyPrompt: string = `You are a respectful love letter writer. Keep the content tasteful and appropriate. 
Do not include any explicit or inappropriate content. Focus on expressing genuine emotions and feelings.`;

export const POST: APIRoute = withRateLimit(async ({ request }) => {
  try {
    const rawData = await request.json();
    if (!rawData) {
      throw new Error("Request body is empty");
    }

    const data = RequestSchema.parse(rawData);
    const { recipient, relationship, tone, details } = data;

    const sanitizedRecipient = recipient.trim().replace(/[^\w\s]/gi, '');
    const sanitizedDetails = details ? details.trim() : '';

    const prompt = `${safetyPrompt}
Write a ${tone} love letter to my ${relationship} named ${sanitizedRecipient}. ${
      sanitizedDetails ? `Include these details: ${sanitizedDetails}` : ''
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: safetyPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = {
      letter: completion.choices[0].message.content,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    const errorResponse = {
      error: error instanceof z.ZodError 
        ? error.errors.map(e => e.message).join(", ")
        : error instanceof Error ? error.message : 'An unexpected error occurred'
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: error instanceof z.ZodError ? 400 : 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
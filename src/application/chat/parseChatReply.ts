import { z } from 'zod';

export const chatResponseSchema = z.object({
  reply: z.string().optional().nullable(),
  response: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  answer: z.string().optional().nullable(),
  text: z.string().optional().nullable(),
  intent: z.enum(['search_vehicle', 'financing', 'contact', 'general']).default('general'),
  leadUpdate: z.object({
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    consent: z.boolean().nullable().optional(),
  }).default({}),
  vehicleIds: z.array(z.string()).default([]),
  shouldCreateLead: z.boolean().default(false),
});

export type ParsedChatResponse = {
  reply: string;
  intent: 'search_vehicle' | 'financing' | 'contact' | 'general';
  leadUpdate: {
    name?: string | null;
    phone?: string | null;
    consent?: boolean | null;
  };
  vehicleIds: string[];
  shouldCreateLead: boolean;
};

/**
 * Parses the raw assistant reply from OpenRouter defensively.
 * Attempts to parse JSON blocks (handling markdown code-fences and alternative keys).
 * Falls back to plain text or a safe response if parsing fails or results are empty.
 */
export function parseChatReply(rawContent: string): ParsedChatResponse {
  let cleaned = rawContent.trim();
  
  // 1. Remove markdown code fences first
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```(?:json)?([\s\S]*?)```/g, '$1').trim();
  }
  // Remove wrapping single backticks if any
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }

  // 2. Try to find a JSON pattern between curly braces
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    
    try {
      const parsedObj = JSON.parse(jsonCandidate);
      const result = chatResponseSchema.safeParse(parsedObj);
      
      if (result.success) {
        const parsed = result.data;
        const extractedReply =
          parsed.reply ??
          parsed.response ??
          parsed.message ??
          parsed.content ??
          parsed.answer ??
          parsed.text;
          
        if (extractedReply && extractedReply.trim()) {
          return {
            reply: extractedReply.trim(),
            intent: parsed.intent,
            leadUpdate: {
              name: parsed.leadUpdate?.name || null,
              phone: parsed.leadUpdate?.phone || null,
              consent: parsed.leadUpdate?.consent !== undefined ? parsed.leadUpdate.consent : null,
            },
            vehicleIds: parsed.vehicleIds,
            shouldCreateLead: parsed.shouldCreateLead,
          };
        }
      }
    } catch (e) {
      console.warn('[parseChatReply] Fallo al parsear JSON candidato:', e);
    }
  }

  // 3. Fallback: If it starts like a JSON but failed parsing, try manual extract
  let fallbackReply = cleaned;
  if (fallbackReply.startsWith('{') && fallbackReply.endsWith('}')) {
    try {
      const manual = JSON.parse(fallbackReply);
      const manualReply =
        manual.reply ??
        manual.response ??
        manual.message ??
        manual.content ??
        manual.answer ??
        manual.text;
      if (typeof manualReply === 'string' && manualReply.trim()) {
        fallbackReply = manualReply.trim();
      } else {
        fallbackReply = 'No pude generar una respuesta en este momento. Intenta nuevamente.';
      }
    } catch {
      fallbackReply = 'No pude generar una respuesta en este momento. Intenta nuevamente.';
    }
  }

  // Final check: if the text is empty or blank, return the safe message
  if (!fallbackReply.trim()) {
    fallbackReply = 'No pude generar una respuesta en este momento. Intenta nuevamente.';
  }

  return {
    reply: fallbackReply,
    intent: 'general',
    leadUpdate: {
      name: null,
      phone: null,
      consent: null,
    },
    vehicleIds: [],
    shouldCreateLead: false,
  };
}

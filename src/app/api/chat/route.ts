import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createVehicleRepository } from '../../../infrastructure/repositories/vehicle-repository-factory';
import { AppsScriptKnowledgeRepository } from '../../../infrastructure/apps-script/AppsScriptKnowledgeRepository';
import { AppsScriptSettingsRepository } from '../../../infrastructure/apps-script/AppsScriptSettingsRepository';
import { AppsScriptLeadRepository } from '../../../infrastructure/apps-script/AppsScriptLeadRepository';
import { AppsScriptConversationRepository } from '../../../infrastructure/apps-script/AppsScriptConversationRepository';
import { buildMrCarSystemPrompt } from '../../../application/chat/buildMrCarSystemPrompt';
import { OpenRouterChatService } from '../../../infrastructure/openrouter/OpenRouterChatService';
import { parseChatReply } from '../../../application/chat/parseChatReply';
import { env } from '../../../infrastructure/config/env';

// 1. Zod input validation schema
const chatRequestSchema = z.object({
  conversationId: z.string().min(1).max(100),
  message: z.string().min(1).max(1500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      })
    )
    .max(20)
    .optional()
    .default([]),
  lead: z
    .object({
      state: z.enum(['assisting', 'awaiting_name', 'awaiting_phone', 'awaiting_consent', 'lead_complete']).optional().default('assisting'),
      name: z.string().max(100).optional().nullable(),
      phone: z.string().max(30).optional().nullable(),
      consent: z.boolean().optional().nullable(),
      leadCreated: z.boolean().optional().nullable(),
      usefulInteractionCount: z.number().optional().default(0),
      email: z.string().max(100).email().optional().nullable().or(z.literal('')),
    })
    .optional(),
  vehicleId: z.string().max(50).optional().nullable(),
  vehicleInterest: z.string().max(100).optional().nullable(),
});

// 2. In-memory Rate Limiting per conversationId
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const processedLeadsSet = new Set<string>();

function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
    return false;
  }

  if (now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
    return false;
  }

  limit.count += 1;
  return limit.count > 15; // Max 15 messages per minute
}

// 3. Helper to normalize text (remove punctuation and trim)
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[¿?¡!,.]/g, '')
    .replace(/\s+/g, ' ');
}

// 4. Helper to detect useful customer interactions or commercial questions
function isCommercialInquiry(msg: string): boolean {
  const normalized = normalizeText(msg);
  const keywords = [
    'toyota', 'honda', 'camry', 'corolla', 'accord',
    'buscar', 'busco', 'quiero', 'necesito', 'tienen', 'tiene', 'mostrar', 'muestrame', 'muéstrame',
    'precio', 'costo', 'cuesta', 'cuánto', 'cuanto', 'valor', 'presupuesto', 'mil',
    'financiamiento', 'credito', 'crédito', 'cuotas', 'financiación', 'financiacion', 'garantizado',
    'disponible', 'disponibilidad', 'suv', 'sedan', 'sedán', 'transmisión', 'transmision', 'automatico', 'automático',
    'millas', 'mileage', 'kilometraje'
  ];
  return keywords.some((w) => normalized.includes(w));
}

// 5. Helper to detect bypass or rejection expressions (full match or simple negative words)
function detectsRejection(msg: string): boolean {
  const normalized = normalizeText(msg);
  const declinedPhrases = [
    'no',
    'no acepto',
    'no autorizo',
    'prefiero no darlo',
    'no quiero compartirlo',
    'no me contacten',
    'no quiero',
    'prefiero no decir',
    'prefiero no decirlo',
    'no gracias',
    'omitir',
    'pasar'
  ];

  if (declinedPhrases.includes(normalized)) return true;

  const words = normalized.split(/\s+/);
  if (words.includes('no')) {
    if (words.length <= 2) return true;
  }

  return false;
}

// 6. Helper to parse consent responses explicitly
function parseConsent(msg: string): 'accepted' | 'declined' | 'unknown' {
  const normalized = normalizeText(msg);
  const acceptedPhrases = [
    'si', 'sí', 'acepto', 'estoy de acuerdo', 'estoy deacuerdo', 'autorizo',
    'pueden contactarme', 'sí autorizo', 'si autorizo', 'ok', 'esta bien',
    'está bien', 'claro', 'por supuesto', 'dale', 'yes', 'yep'
  ];
  const declinedPhrases = [
    'no', 'no acepto', 'no autorizo', 'prefiero no', 'prefiero no darlo',
    'no quiero compartirlo', 'no me contacten', 'continuar sin dar el teléfono',
    'continuar sin dar el telefono', 'no quiero'
  ];

  if (acceptedPhrases.includes(normalized)) return 'accepted';
  if (declinedPhrases.includes(normalized)) return 'declined';

  const words = normalized.split(/\s+/);
  if (words.includes('si') || words.includes('sí') || words.includes('acepto')) return 'accepted';
  if (words.includes('no')) return 'declined';

  return 'unknown';
}

// 7. Helper to validate if the input looks like a real person's name
function isValidPersonName(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed.length > 60) return false;

  // Reject if it has more than 5 words
  const words = trimmed.split(/\s+/);
  if (words.length > 5) return false;

  // Reject if it contains numbers
  if (/\d/.test(trimmed)) return false;

  // Reject if it contains question marks
  if (trimmed.includes('?') || trimmed.includes('¿')) return false;

  const normalized = trimmed.toLowerCase();

  // Reject blocked exact match greetings
  const blockedExact = ['si', 'sí', 'no', 'hola', 'gracias', 'ok'];
  if (blockedExact.includes(normalized)) return false;

  // Reject blocked keywords
  const blockedKeywords = [
    'financiamiento', 'vehículo', 'vehiculo', 'precio', 'cuánto', 'cuanto',
    'tienen', 'garantizado', 'disponible', 'busco', 'quiero', 'necesito'
  ];
  if (blockedKeywords.some((keyword) => normalized.includes(keyword))) return false;

  return true;
}

// 8. Helper to parse basic search criteria from text
function parseSearchCriteria(msg: string): { make?: string; maxPrice?: number } | null {
  const normalized = normalizeText(msg);
  
  let make: string | undefined = undefined;
  if (normalized.includes('toyota')) make = 'Toyota';
  else if (normalized.includes('honda')) make = 'Honda';

  let maxPrice: number | undefined = undefined;
  const priceRegex = /(?:menos de|bajo|hasta|maximo|máximo|presupuesto de|\$)\s*(\d{1,3}(?:[.,]\d{3})*|\d+)/i;
  const match = normalized.match(priceRegex);
  if (match) {
    const numStr = match[1].replace(/[.,]/g, '');
    let num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      if (normalized.includes(numStr + ' mil') || normalized.includes(numStr + 'mil') || num < 1000) {
        if (num < 1000) num = num * 1000;
      }
      maxPrice = num;
    }
  } else {
    const milRegex = /(\d+)\s*mil/i;
    const milMatch = normalized.match(milRegex);
    if (milMatch) {
      maxPrice = parseInt(milMatch[1], 10) * 1000;
    }
  }

  if (make || maxPrice) {
    return { make, maxPrice };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // A. Parse and validate JSON input
    const body = await req.json();
    const result = chatRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Petición inválida o excedió los límites de caracteres permitidos.' },
        { status: 400 }
      );
    }

    const { conversationId, message, history, lead, vehicleId, vehicleInterest } = result.data;

    // B. Check Rate Limit
    const clientIp = req.headers.get('x-forwarded-for') || 'local';
    const rateLimitKey = `${clientIp}:${conversationId}`;
    if (checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Has enviado demasiados mensajes. Por favor, espera un minuto.' },
        { status: 429 }
      );
    }

    // C. Instantiate Repositories
    const vehicleRepo = createVehicleRepository();
    const knowledgeRepo = new AppsScriptKnowledgeRepository();
    const settingsRepo = new AppsScriptSettingsRepository();
    const leadRepo = new AppsScriptLeadRepository();
    const conversationRepo = new AppsScriptConversationRepository();

    // D. Fetch data concurrently
    const [vehicles, knowledge, settings] = await Promise.all([
      vehicleRepo.getVehicles(),
      knowledgeRepo.getKnowledge().catch(() => []),
      settingsRepo.getSettings().catch(() => ({})),
    ]);

    // E. State Machine Processing
    const currentLeadState = {
      state: lead?.state || 'assisting',
      name: lead?.name || null,
      phone: lead?.phone || null,
      consent: lead?.consent !== undefined && lead?.consent !== null ? lead.consent : null,
      leadCreated: !!lead?.leadCreated,
      usefulInteractionCount: lead?.usefulInteractionCount || 0,
    };

    let replyText = '';
    let nextState = currentLeadState.state;
    const leadUpdate = {
      state: currentLeadState.state,
      name: currentLeadState.name,
      phone: currentLeadState.phone,
      consent: currentLeadState.consent,
      leadCreated: currentLeadState.leadCreated,
      usefulInteractionCount: currentLeadState.usefulInteractionCount,
    };
    let vehicleIds: string[] = [];
    let shouldCallLLM = false;

    // A commercial inquiry overrides/postpones lead capturing transitions
    const isCommercial = isCommercialInquiry(message);
    const isRejection = detectsRejection(message);

    if (isCommercial) {
      // 1. Process as commercial query
      shouldCallLLM = true;
      nextState = currentLeadState.state; // keep current state
      if (currentLeadState.state === 'assisting') {
        leadUpdate.usefulInteractionCount += 1;
      }
    } else {
      // 2. Process state machine transitions
      if (currentLeadState.state === 'lead_complete') {
        shouldCallLLM = true;
        nextState = 'lead_complete';
        leadUpdate.state = 'lead_complete';
      } else if (currentLeadState.state === 'assisting') {
        shouldCallLLM = true;
        nextState = 'assisting';
        leadUpdate.state = 'assisting';
      } else if (currentLeadState.state === 'awaiting_name') {
        if (isRejection) {
          replyText = 'Entendido, no hay problema. Continuamos ayudándote aquí por el chat. ¿Qué otra duda tienes sobre nuestros autos?';
          nextState = 'assisting';
          leadUpdate.state = 'assisting';
          leadUpdate.name = null;
          leadUpdate.phone = null;
          leadUpdate.consent = null;
          leadUpdate.leadCreated = false;
        } else if (isValidPersonName(message)) {
          const userName = message.trim();
          replyText = `Mucho gusto, ${userName}. ¿Cuál es el mejor número para que un asesor pueda contactarte sobre esta consulta?`;
          nextState = 'awaiting_phone';
          leadUpdate.state = 'awaiting_phone';
          leadUpdate.name = userName;
        } else {
          shouldCallLLM = true;
          nextState = 'awaiting_name';
          leadUpdate.state = 'awaiting_name';
        }
      } else if (currentLeadState.state === 'awaiting_phone') {
        if (isRejection) {
          replyText = 'Entendido, no hay problema. Continuamos ayudándote aquí por el chat. ¿Qué otra duda tienes sobre nuestros autos?';
          nextState = 'assisting';
          leadUpdate.state = 'assisting';
          leadUpdate.phone = null;
          leadUpdate.consent = null;
          leadUpdate.leadCreated = false;
        } else {
          const cleanPhone = message.replace(/[^0-9]/g, '');
          const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
          if (isValid) {
            replyText = 'Al compartir tu número, autorizas a Mr. Car Automotive Group a contactarte sobre esta consulta. Pueden aplicar tarifas de mensajes y datos. ¿Estás de acuerdo?';
            nextState = 'awaiting_consent';
            leadUpdate.state = 'awaiting_consent';
            leadUpdate.phone = cleanPhone;
          } else {
            replyText = 'El número ingresado no parece válido. Por favor, escribe tu número de teléfono con código de área (por ejemplo: 240-319-5266) para poder contactarte.';
            nextState = 'awaiting_phone';
            leadUpdate.state = 'awaiting_phone';
          }
        }
      } else if (currentLeadState.state === 'awaiting_consent') {
        const consentResult = parseConsent(message);
        if (consentResult === 'accepted') {
          replyText = 'Gracias. Un asesor podrá contactarte para ayudarte con esta consulta.';
          nextState = 'awaiting_consent';
          leadUpdate.state = 'awaiting_consent';
          leadUpdate.consent = true;
        } else if (consentResult === 'declined') {
          replyText = 'Entendido, no te preocupes. Continuamos ayudándote aquí por el chat. ¿Tienes alguna otra pregunta sobre nuestros vehículos?';
          nextState = 'assisting';
          leadUpdate.state = 'assisting';
          leadUpdate.consent = false;
          leadUpdate.phone = null;
          leadUpdate.leadCreated = false;
        } else {
          replyText = 'Por favor, indícanos con un \'Sí\' o \'No\' si estás de acuerdo en que un asesor te contacte por este medio sobre tu consulta.';
          nextState = 'awaiting_consent';
          leadUpdate.state = 'awaiting_consent';
        }
      }
    }

    let finalReply = replyText;

    // Check if we can intercept with a deterministic search response
    if (shouldCallLLM && isCommercial) {
      const searchCriteria = parseSearchCriteria(message);
      if (searchCriteria && (searchCriteria.make === 'Toyota' || searchCriteria.make === 'Honda')) {
        const matches = vehicles.filter((v) => {
          if (searchCriteria.make && v.make.toLowerCase() !== searchCriteria.make.toLowerCase()) return false;
          if (searchCriteria.maxPrice && (v.price === null || v.price === undefined || v.price > searchCriteria.maxPrice)) return false;
          if (v.status === 'Oculto' || v.status === 'Vendido') return false;
          return true;
        });

        if (matches.length > 0) {
          shouldCallLLM = false; // Bypass OpenRouter
          vehicleIds = matches.map((v) => v.id);
          const makeText = searchCriteria.make || 'vehículo';
          const matchesLines = matches
            .map((v) => {
              const priceText = v.price !== null && v.price !== undefined ? `$${v.price.toLocaleString('en-US')}` : 'Precio a consultar';
              return `• ${v.make} ${v.model} ${v.version || ''} ${v.year} — ${priceText} — ${v.status}.`.replace(/\s+/g, ' ');
            })
            .join('\n');
          
          const matchCountWord = matches.length === 2 ? 'dos' : matches.length === 1 ? 'un' : String(matches.length);
          finalReply = `Tenemos ${matchCountWord} ${makeText} dentro de ese presupuesto:\n\n${matchesLines}\n\n¿Quieres que te muestre más detalles de alguno?`;
        }
      }
    }

    // F. Execute LLM Call only if state warrants it and not bypassed
    if (shouldCallLLM) {
      const systemPrompt = buildMrCarSystemPrompt({
        settings,
        knowledge: Array.isArray(knowledge) ? knowledge : [],
        vehicles,
        leadState: {
          name: leadUpdate.name || undefined,
          phone: leadUpdate.phone || undefined,
          consent: leadUpdate.consent || undefined,
        },
      });

      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.map((h) => ({
          role: h.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: h.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const chatService = new OpenRouterChatService();
      let llmReply = '';
      try {
        llmReply = await chatService.generateReply(apiMessages);
      } catch (chatError) {
        const errMsg = chatError instanceof Error ? chatError.message : String(chatError);
        console.error('[Route Handler API Chat] Error en OpenRouter:', errMsg);
        return NextResponse.json(
          { success: false, error: 'No pude responder en este momento. Puedes intentarlo nuevamente o comunicarte con un asesor.' },
          { status: 503 }
        );
      }

      const parsedResponse = parseChatReply(llmReply);
      finalReply = parsedResponse.reply;
      vehicleIds = parsedResponse.vehicleIds;
    }

    // G. Deterministic Lead Creation
    const activeName = leadUpdate.name || '';
    const activePhone = leadUpdate.phone || '';
    const activeConsent = leadUpdate.consent;
    const activeLeadCreated = leadUpdate.leadCreated;

    const consentIsStrictTrue = activeConsent === true;
    const isAlreadyProcessed = processedLeadsSet.has(conversationId);

    const canCreateLead =
      Boolean(activeName?.trim()) &&
      isValidPhone(activePhone) &&
      consentIsStrictTrue &&
      activeLeadCreated !== true &&
      !isAlreadyProcessed;

    // Server-side logging without secrets (Requirement 1)
    console.log('[LEAD DEBUG LOG]', {
      env: process.env.NODE_ENV || 'development',
      hasApiUrl: !!env.APPS_SCRIPT_API_URL,
      hasApiSecret: !!(process.env.APPS_SCRIPT_WRITE_SECRET || env.APPS_SCRIPT_WRITE_SECRET),
      hasName: Boolean(activeName?.trim()),
      hasPhone: Boolean(activePhone),
      phoneIsValid: isValidPhone(activePhone),
      consentValue: activeConsent,
      consentIsStrictTrue,
      currentLeadState: nextState,
      canCreateLead,
      leadCreatedAlready: activeLeadCreated,
      isAlreadyProcessed,
    });

    if (canCreateLead) {
      console.log('[LEAD DEBUG LOG] Intentando llamar saveLead...');
      try {
        const leadSaved = await leadRepo.saveLead({
          conversationId,
          name: activeName.trim(),
          phone: activePhone.replace(/[^0-9]/g, ''),
          email: lead?.email || undefined,
          vehicleId: vehicleId || undefined,
          vehicleInterest: vehicleInterest || undefined,
          consent: true,
          lastMessage: message,
        });

        console.log('[LEAD DEBUG LOG] Resultado de saveLead:', leadSaved);

        if (leadSaved) {
          leadUpdate.leadCreated = true;
          leadUpdate.state = 'lead_complete';
          nextState = 'lead_complete';
          processedLeadsSet.add(conversationId);
        } else {
          leadUpdate.leadCreated = false;
          console.warn('[Route Handler] Advertencia segura: Falló el guardado del lead en Apps Script.');
        }
      } catch (error) {
        leadUpdate.leadCreated = false;
        console.error('[Route Handler] Error de red/excepción al guardar lead:', error);
      }
    }

    // H. Suffix Append for State Machine Capturing
    const wasAssistingAndThresholdReached = currentLeadState.state === 'assisting' && leadUpdate.usefulInteractionCount >= 2 && !currentLeadState.name;
    const isStillAwaitingName = nextState === 'awaiting_name';

    if (wasAssistingAndThresholdReached || isStillAwaitingName) {
      if (!finalReply.includes('¿cómo te llamas?')) {
        finalReply = `${finalReply}\n\nPor cierto, ¿cómo te llamas?`;
      }
      if (wasAssistingAndThresholdReached) {
        nextState = 'awaiting_name';
        leadUpdate.state = 'awaiting_name';
      }
    } else if (nextState === 'awaiting_phone') {
      if (!finalReply.includes('¿Cuál es el mejor número')) {
        finalReply = `${finalReply}\n\n¿Cuál es el mejor número para que un asesor pueda contactarte sobre esta consulta?`;
      }
    } else if (nextState === 'awaiting_consent') {
      if (!finalReply.includes('¿Estás de acuerdo')) {
        finalReply = `${finalReply}\n\n¿Estás de acuerdo en que un asesor te contacte por este medio sobre tu consulta?`;
      }
    }

    // H. Non-blocking Background Writes to Google Sheets
    // 1. User Message
    conversationRepo
      .saveMessage({
        conversationId,
        role: 'user',
        message: message,
        vehicleId: vehicleId || undefined,
        name: leadUpdate.name || undefined,
        phone: leadUpdate.phone || undefined,
      })
      .catch((err) => console.warn('[Route Handler] Fallo al guardar mensaje de usuario:', err));

    // 2. Assistant Message
    conversationRepo
      .saveMessage({
        conversationId,
        role: 'assistant',
        message: finalReply,
        vehicleId: vehicleId || undefined,
        name: leadUpdate.name || undefined,
        phone: leadUpdate.phone || undefined,
      })
      .catch((err) => console.warn('[Route Handler] Fallo al guardar mensaje de asistente:', err));

    // I. Return response JSON matching requirements
    const recommendedVehicles = vehicles
      .filter((v) => vehicleIds.includes(v.id))
      .slice(0, 3)
      .map((v) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        version: v.version,
        year: v.year,
        price: v.price,
        mileage: v.mileage,
        mainPhoto: v.mainPhoto,
        slug: v.slug,
        status: v.status,
      }));

    return NextResponse.json({
      success: true,
      reply: finalReply,
      leadState: nextState,
      leadUpdate: {
        state: nextState,
        name: leadUpdate.name || null,
        phone: leadUpdate.phone || null,
        consent: leadUpdate.consent,
        leadCreated: leadUpdate.leadCreated,
        usefulInteractionCount: leadUpdate.usefulInteractionCount,
      },
      vehicleIds: vehicleIds,
      recommendedVehicles,
    });
  } catch (error) {
    console.error('[Route Handler API Chat] Error fatal:', error);
    return NextResponse.json(
      { success: false, error: 'No pude responder en este momento. Puedes intentarlo nuevamente o comunicarte con un asesor.' },
      { status: 500 }
    );
  }
}

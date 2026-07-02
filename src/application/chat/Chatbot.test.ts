import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildMrCarSystemPrompt } from './buildMrCarSystemPrompt';
import { parseChatReply } from './parseChatReply';
import { OpenRouterChatService } from '../../infrastructure/openrouter/OpenRouterChatService';
import { 
  OpenRouterTimeoutError, 
  OpenRouterRateLimitError, 
  OpenRouterUnauthorizedError, 
  OpenRouterInvalidResponseError 
} from '../../infrastructure/openrouter/errors';
import { AppsScriptKnowledgeRepository } from '../../infrastructure/apps-script/AppsScriptKnowledgeRepository';
import { AppsScriptSettingsRepository } from '../../infrastructure/apps-script/AppsScriptSettingsRepository';
import { AppsScriptLeadRepository } from '../../infrastructure/apps-script/AppsScriptLeadRepository';
import { AppsScriptConversationRepository } from '../../infrastructure/apps-script/AppsScriptConversationRepository';
import { Vehicle } from '../../domain/entities/vehicle';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/chat/route';

// Mock env variables using relative path
vi.mock('../../infrastructure/config/env', () => ({
  env: {
    APPS_SCRIPT_API_URL: 'https://script.google.com/test',
    APPS_SCRIPT_WRITE_SECRET: 'test-write-secret',
    APPS_SCRIPT_REVALIDATE_SECONDS: 60,
    OPENROUTER_API_KEY: 'test-api-key',
    OPENROUTER_MODEL: 'test-model',
    OPENROUTER_SITE_URL: 'https://testsite.com',
    OPENROUTER_APP_NAME: 'TestApp',
  },
}));

// Mock the vehicle repository factory to return our mock vehicles
vi.mock('../../infrastructure/repositories/vehicle-repository-factory', () => ({
  createVehicleRepository: () => ({
    getVehicles: async () => mockVehicles,
  }),
}));

const mockVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    make: 'Toyota',
    model: 'Corolla',
    version: 'LE',
    year: 2020,
    price: 16000,
    mileage: 30000,
    status: 'Disponible',
    vehicleType: 'Sedan',
    transmission: 'Automatic',
    fuel: 'Gasolina',
    traction: 'FWD',
    engine: '1.8L',
    doors: 4,
    vin: '1234567890VINXXXX',
    description: 'Excelente estado.',
    features: ['Aire acondicionado', 'Bluetooth'],
    photos: ['photo1.png'],
    mainPhoto: 'photo1.png',
    city: 'Miami',
    stateUsa: 'FL',
    whatsapp: '12345',
    publishDate: '2026-07-01',
    slug: 'toyota-corolla-2020-veh-1',
  },
  {
    id: 'veh-2',
    make: 'Honda',
    model: 'Civic',
    version: 'EX',
    year: 2018,
    price: 15000,
    mileage: 45000,
    status: 'Oculto',
    vehicleType: 'Sedan',
    transmission: 'Automatic',
    fuel: 'Gasolina',
    traction: 'FWD',
    engine: '2.0L',
    doors: 4,
    vin: 'HONDA987654321VIN',
    description: 'Oculto para pruebas.',
    features: ['Sunroof'],
    photos: ['photo2.png'],
    mainPhoto: 'photo2.png',
    city: 'Orlando',
    stateUsa: 'FL',
    whatsapp: '12345',
    publishDate: '2026-07-01',
    slug: 'honda-civic-2018-veh-2',
  },
  {
    id: 'veh-3',
    make: 'Toyota',
    model: 'Camry',
    version: 'XLE',
    year: 2012,
    price: 12000,
    mileage: 110000,
    status: 'Reservado',
    vehicleType: 'Sedan',
    transmission: 'Automatic',
    fuel: 'Gasolina',
    traction: 'FWD',
    engine: '2.5L',
    doors: 4,
    vin: 'TOYOTA987654321VIN',
    description: 'Excelente estado, reservado.',
    features: ['Sunroof', 'Leather Seats'],
    photos: ['photo3.png'],
    mainPhoto: 'photo3.png',
    city: 'Orlando',
    stateUsa: 'FL',
    whatsapp: '12345',
    publishDate: '2026-07-01',
    slug: 'toyota-camry-2012-veh-3',
  },
];

describe('Chatbot y OpenRouter Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildMrCarSystemPrompt', () => {
    it('debe generar el prompt correcto inyectando configuraciones, FAQs e inventario activo sin VIN', () => {
      const settings = { nombre: 'Mr. Car Custom', whatsapp: '18005550100', direccion: 'Orlando, FL' };
      const knowledge = [{ Pregunta: '¿Hacen entregas?', Respuesta: 'Sí, a todo el país.' }];
      
      const prompt = buildMrCarSystemPrompt({
        settings,
        knowledge,
        vehicles: mockVehicles,
        leadState: { name: 'Juan', phone: '123456', consent: true },
      });

      expect(prompt).toContain('Mr. Car Custom');
      expect(prompt).toContain('Orlando, FL');
      expect(prompt).toContain('¿Hacen entregas?');
      expect(prompt).toContain('Sí, a todo el país.');
      expect(prompt).toContain('Toyota');
      expect(prompt).toContain('Corolla');
      expect(prompt).not.toContain('1234567890VINXXXX');
      expect(prompt).not.toContain('Honda');
    });
  });

  describe('parseChatReply', () => {
    it('debe procesar respuestas JSON estructuradas correctamente con la clave "reply"', () => {
      const jsonResponse = `{
        "reply": "Hola Juan, te recomiendo el Corolla.",
        "intent": "search_vehicle",
        "leadUpdate": {
          "name": "Juan Carlos",
          "phone": "5551234",
          "consent": true
        },
        "vehicleIds": ["veh-1"],
        "shouldCreateLead": true
      }`;

      const result = parseChatReply(jsonResponse);
      expect(result.reply).toBe('Hola Juan, te recomiendo el Corolla.');
      expect(result.intent).toBe('search_vehicle');
      expect(result.leadUpdate.name).toBe('Juan Carlos');
      expect(result.leadUpdate.phone).toBe('5551234');
      expect(result.leadUpdate.consent).toBe(true);
      expect(result.vehicleIds).toContain('veh-1');
      expect(result.shouldCreateLead).toBe(true);
    });

    it('debe procesar respuestas JSON estructuradas de forma compatible utilizando la clave "response"', () => {
      const jsonResponse = `{
        "response": "No, el financiamiento depende de condiciones específicas.",
        "intent": "financing",
        "leadUpdate": {},
        "vehicleIds": [],
        "shouldCreateLead": false
      }`;

      const result = parseChatReply(jsonResponse);
      expect(result.reply).toBe('No, el financiamiento depende de condiciones específicas.');
      expect(result.intent).toBe('financing');
      expect(result.shouldCreateLead).toBe(false);
    });

    it('debe parsear defensivamente respuestas con bloques markdown de tipo JSON con fences', () => {
      const markdownResponse = `\`\`\`json
      {
        "reply": "Mensaje en markdown.",
        "intent": "financing",
        "leadUpdate": {},
        "vehicleIds": [],
        "shouldCreateLead": false
      }
      \`\`\``;

      const result = parseChatReply(markdownResponse);
      expect(result.reply).toBe('Mensaje en markdown.');
      expect(result.intent).toBe('financing');
      expect(result.shouldCreateLead).toBe(false);
    });

    it('debe retroceder con gracia a texto plano ante respuestas inválidas de JSON', () => {
      const plainText = 'Lo siento, no entiendo. ¿Quieres hablar con un asesor?';
      const result = parseChatReply(plainText);
      
      expect(result.reply).toBe(plainText);
      expect(result.intent).toBe('general');
      expect(result.vehicleIds).toEqual([]);
      expect(result.shouldCreateLead).toBe(false);
    });

    it('debe retroceder a texto plano ante JSON malformado e incompleto', () => {
      const badJson = '{"reply": "Mensaje incompleto...';
      const result = parseChatReply(badJson);
      expect(result.reply).toBe(badJson);
    });

    it('debe devolver un mensaje seguro si el JSON no tiene propiedades de texto válidas (objeto sin texto)', () => {
      const emptyJson = '{"intent": "general", "vehicleIds": []}';
      const result = parseChatReply(emptyJson);
      expect(result.reply).toBe('No pude generar una respuesta en este momento. Intenta nuevamente.');
    });

    it('debe devolver un mensaje seguro si la respuesta de texto original es vacía o blanca', () => {
      const emptyText = '   ';
      const result = parseChatReply(emptyText);
      expect(result.reply).toBe('No pude generar una respuesta en este momento. Intenta nuevamente.');
    });
  });

  describe('OpenRouterChatService', () => {
    it('debe retornar la respuesta generada exitosamente en condiciones normales', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Respuesta simulada',
              },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      const service = new OpenRouterChatService();
      const reply = await service.generateReply([{ role: 'user', content: 'hola' }]);
      expect(reply).toBe('Respuesta simulada');
    });

    it('debe lanzar OpenRouterUnauthorizedError ante código HTTP 401', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      });

      const service = new OpenRouterChatService();
      await expect(service.generateReply([])).rejects.toThrow(OpenRouterUnauthorizedError);
    });

    it('debe lanzar OpenRouterRateLimitError ante código HTTP 429', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 429,
        ok: false,
      });

      const service = new OpenRouterChatService();
      await expect(service.generateReply([])).rejects.toThrow(OpenRouterRateLimitError);
    });

    it('debe lanzar OpenRouterTimeoutError si se excede el tiempo de respuesta', async () => {
      global.fetch = vi.fn().mockRejectedValue({
        name: 'AbortError',
        message: 'The user aborted a request.',
      });

      const service = new OpenRouterChatService();
      await expect(service.generateReply([])).rejects.toThrow(OpenRouterTimeoutError);
    });

    it('debe lanzar OpenRouterInvalidResponseError si el JSON recibido es incompleto', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          invalid_payload: true,
        }),
      });

      const service = new OpenRouterChatService();
      await expect(service.generateReply([])).rejects.toThrow(OpenRouterInvalidResponseError);
    });
  });

  describe('Apps Script Repositories', () => {
    it('KnowledgeRepository debe obtener la base de conocimientos con éxito', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          success: true,
          knowledge: [{ key: 'faq1', value: 'res1' }],
        }),
      });

      const repo = new AppsScriptKnowledgeRepository();
      const res = await repo.getKnowledge();
      expect(res).toEqual([{ key: 'faq1', value: 'res1' }]);
    });

    it('SettingsRepository debe obtener los ajustes con éxito', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({
          success: true,
          settings: { nombre: 'Mr. Car Florida' },
        }),
      });

      const repo = new AppsScriptSettingsRepository();
      const res = await repo.getSettings();
      expect(res).toEqual({ nombre: 'Mr. Car Florida' });
    });

    it('LeadRepository debe enviar los datos de lead por POST con éxito', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });

      const repo = new AppsScriptLeadRepository();
      const success = await repo.saveLead({
        conversationId: 'c-1',
        name: 'Carlos',
        phone: '12345',
        consent: true,
      });
      expect(success).toBe(true);
    });

    it('ConversationRepository debe registrar el mensaje por POST con éxito', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });

      const repo = new AppsScriptConversationRepository();
      const success = await repo.saveMessage({
        conversationId: 'c-1',
        role: 'user',
        message: 'Prueba',
      });
      expect(success).toBe(true);
    });
  });

  describe('Deterministic Lead State Machine (Server-side Route)', () => {
    const makeMockRequest = (payload: Record<string, unknown>) => {
      return new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    };

    beforeEach(() => {
      // Mock global fetch to return success responses for settings/knowledge and OpenRouter API
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('action=settings')) {
          return Promise.resolve({
            status: 200,
            ok: true,
            json: async () => ({ success: true, settings: { nombre: 'Mr. Car Custom' } }),
          });
        }
        if (url.includes('action=knowledge')) {
          return Promise.resolve({
            status: 200,
            ok: true,
            json: async () => ({ success: true, knowledge: [] }),
          });
        }
        // Mock OpenRouter
        if (url.includes('chat/completions')) {
          return Promise.resolve({
            status: 200,
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: '{"reply": "Mensaje normal del modelo.", "intent": "general", "vehicleIds": []}',
                  },
                },
              ],
            }),
          });
        }
        // Write endpoints (saveLead/saveMessage)
        return Promise.resolve({
          status: 200,
          ok: true,
          json: async () => ({ success: true }),
        });
      });
    });

    it('primera interacción: no debe preguntar el nombre', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-1',
        message: 'Busco un Toyota por menos de $17,000.',
        history: [],
        lead: {
          state: 'assisting',
          usefulInteractionCount: 0,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Toyota Corolla');
      expect(data.leadState).toBe('assisting');
      expect(data.leadUpdate.usefulInteractionCount).toBe(1);
      expect(data.reply).not.toContain('¿cómo te llamas?');
    });

    it('segunda interacción útil: debe concatenar la pregunta por el nombre al final', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-2',
        message: '¿El financiamiento está garantizado?',
        history: [],
        lead: {
          state: 'assisting',
          usefulInteractionCount: 1, // Already had 1 useful interaction
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mensaje normal del modelo.');
      expect(data.reply).toContain('Por cierto, ¿cómo te llamas?');
      expect(data.leadState).toBe('awaiting_name');
      expect(data.leadUpdate.usefulInteractionCount).toBe(2);
    });

    it('captura de nombre: debe aceptar Katherine como nombre válido', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-3',
        message: 'Katherine',
        history: [],
        lead: {
          state: 'awaiting_name',
          usefulInteractionCount: 2,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mucho gusto, Katherine.');
      expect(data.leadState).toBe('awaiting_phone');
      expect(data.leadUpdate.name).toBe('Katherine');
    });

    it('captura de nombre: debe aceptar Katherine Rodríguez como nombre válido', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-4',
        message: 'Katherine Rodríguez',
        history: [],
        lead: {
          state: 'awaiting_name',
          usefulInteractionCount: 2,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mucho gusto, Katherine Rodríguez.');
      expect(data.leadState).toBe('awaiting_phone');
    });

    it('captura de nombre: debe aceptar Carlos Pérez como nombre válido', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-5',
        message: 'Carlos Pérez',
        history: [],
        lead: {
          state: 'awaiting_name',
          usefulInteractionCount: 2,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mucho gusto, Carlos Pérez.');
      expect(data.leadState).toBe('awaiting_phone');
    });

    it('captura de nombre: debe rechazar preguntas como ¿El financiamiento está garantizado? y responder primero', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-6',
        message: '¿El financiamiento está garantizado?',
        history: [],
        lead: {
          state: 'awaiting_name',
          usefulInteractionCount: 2,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mensaje normal del modelo.');
      expect(data.reply).toContain('Por cierto, ¿cómo te llamas?');
      expect(data.leadState).toBe('awaiting_name'); // Kept state
      expect(data.leadUpdate.name).toBeNull();
    });

    it('captura de nombre: debe rechazar Busco un Toyota como nombre inválido', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-7',
        message: 'Busco un Toyota',
        history: [],
        lead: {
          state: 'awaiting_name',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.leadState).toBe('awaiting_name');
    });

    it('captura de nombre: debe rechazar respuestas cortas de saludo/sí/no', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-8',
        message: 'Sí',
        history: [],
        lead: {
          state: 'awaiting_name',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.leadState).toBe('awaiting_name');
    });

    it('captura de nombre: debe rechazar números en el nombre', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-9',
        message: 'Juan 123',
        history: [],
        lead: {
          state: 'awaiting_name',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.leadState).toBe('awaiting_name');
    });

    it('captura de nombre: debe rechazar nombres mayores a 60 caracteres', async () => {
      const longName = 'A'.repeat(65);
      const req = makeMockRequest({
        conversationId: 'conv-id-10',
        message: longName,
        history: [],
        lead: {
          state: 'awaiting_name',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.leadState).toBe('awaiting_name');
    });

    it('teléfono válido: debe limpiar el teléfono y transicionar a awaiting_consent', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-11',
        message: '+1 (240) 319-5266',
        history: [],
        lead: {
          state: 'awaiting_phone',
          name: 'Katherine',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('autorizas a Mr. Car Automotive Group');
      expect(data.leadState).toBe('awaiting_consent');
      expect(data.leadUpdate.phone).toBe('12403195266'); // cleaned digits
    });

    it('teléfono inválido: debe permanecer en awaiting_phone y avisar al usuario', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-12',
        message: '123-abc-45',
        history: [],
        lead: {
          state: 'awaiting_phone',
          name: 'Katherine',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('El número ingresado no parece válido.');
      expect(data.leadState).toBe('awaiting_phone');
    });

    it('consentimiento afirmativo: debe registrar el lead, transicionar a lead_complete y guardar en Sheets', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-13',
        message: 'Sí, estoy de acuerdo',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Gracias. Un asesor podrá contactarte');
      expect(data.leadState).toBe('lead_complete');
      expect(data.leadUpdate.consent).toBe(true);
      expect(data.leadUpdate.leadCreated).toBe(true);
    });

    it('consentimiento negativo: debe volver a assisting sin guardar el lead', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-14',
        message: 'No, paso',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Entendido, no te preocupes.');
      expect(data.leadState).toBe('assisting');
      expect(data.leadUpdate.consent).toBe(false);
      expect(data.leadUpdate.phone).toBeNull(); // Cleared phone
    });

    it('usuario que quiere seguir sin dar datos (rejection): debe retornar a assisting y liberar el flujo', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-15',
        message: 'prefiero no darlo',
        history: [],
        lead: {
          state: 'awaiting_phone',
          name: 'Katherine',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Entendido, no hay problema. Continuamos ayudándote');
      expect(data.leadState).toBe('assisting');
    });

    it('lead_complete: no debe volver a preguntar por datos y asiste mediante LLM', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-16',
        message: '¿Tienen más modelos?',
        history: [],
        lead: {
          state: 'lead_complete',
          name: 'Katherine',
          phone: '12403195266',
          consent: true,
          leadCreated: true,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toBe('Mensaje normal del modelo.');
      expect(data.leadState).toBe('lead_complete');
    });

    it('Estado assisting + Busco un Toyota por menos de $17,000: debe filtrar determinísticamente y seguir en assisting', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-17',
        message: 'Busco un Toyota por menos de $17,000',
        history: [],
        lead: {
          state: 'assisting',
          usefulInteractionCount: 0,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Toyota Corolla');
      expect(data.reply).toContain('Toyota Camry');
      expect(data.reply).toContain('Reservado');
      expect(data.leadState).toBe('assisting');
      expect(data.vehicleIds).toContain('veh-1'); // Corolla in mock
    });

    it('Estado awaiting_consent + No: debe rechazar consentimiento y volver a assisting sin guardar lead', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-18',
        message: 'No',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Entendido, no te preocupes.');
      expect(data.leadState).toBe('assisting');
      expect(data.leadUpdate.consent).toBe(false);
    });

    it('Estado assisting + No tengo un presupuesto definido: no debe interpretarse como rechazo del chat', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-19',
        message: 'No tengo un presupuesto definido',
        history: [],
        lead: {
          state: 'assisting',
          usefulInteractionCount: 0,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toBe('Mensaje normal del modelo.');
      expect(data.reply).not.toContain('no te preocupes');
      expect(data.leadState).toBe('assisting');
    });

    it('Estado awaiting_name + Busco un Toyota: debe responder la búsqueda, mantener awaiting_name y repreguntar nombre', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-20',
        message: 'Busco un Toyota',
        history: [],
        lead: {
          state: 'awaiting_name',
          name: null,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Toyota Corolla');
      expect(data.reply).toContain('¿cómo te llamas?');
      expect(data.leadState).toBe('awaiting_name');
    });

    it('Estado awaiting_phone + pregunta comercial: debe responder la pregunta, mantener awaiting_phone y repreguntar teléfono', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-21',
        message: '¿El financiamiento está garantizado?',
        history: [],
        lead: {
          state: 'awaiting_phone',
          name: 'Katherine',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mensaje normal del modelo.');
      expect(data.reply).toContain('¿Cuál es el mejor número');
      expect(data.leadState).toBe('awaiting_phone');
    });

    it('Estado awaiting_consent + pregunta comercial: debe responder la pregunta, mantener awaiting_consent y repreguntar consentimiento', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-22',
        message: '¿El Corolla tiene aire acondicionado?',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.reply).toContain('Mensaje normal del modelo.');
      expect(data.reply).toContain('¿Estás de acuerdo');
      expect(data.leadState).toBe('awaiting_consent');
    });

    it('lead creation: name + phone + consent true debe llamar saveLead y transicionar a lead_complete', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });

      const req = makeMockRequest({
        conversationId: 'conv-id-lead-success',
        message: 'Sí, de acuerdo',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
          consent: null,
          leadCreated: false,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.leadState).toBe('lead_complete');
      expect(data.leadUpdate.leadCreated).toBe(true);
    });

    it('lead creation: consent false no debe crear lead', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-lead-consent-false',
        message: 'No acepto',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
          consent: null,
          leadCreated: false,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.leadState).toBe('assisting');
      expect(data.leadUpdate.leadCreated).toBe(false);
    });

    it('lead creation: phone inválido no debe crear lead', async () => {
      const req = makeMockRequest({
        conversationId: 'conv-id-lead-bad-phone',
        message: 'Sí',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '123',
          consent: null,
          leadCreated: false,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.leadUpdate.leadCreated).toBe(false);
    });

    it('lead creation: si falla Apps Script no debe marcar leadCreated', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: false }),
      });

      const req = makeMockRequest({
        conversationId: 'conv-id-lead-failed-backend',
        message: 'Acepto',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
          consent: null,
          leadCreated: false,
        },
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.leadUpdate.leadCreated).toBe(false);
      expect(data.leadState).toBe('awaiting_consent');
    });

    it('lead creation: misma conversación no debe crear lead duplicado (idempotencia)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });

      const req1 = makeMockRequest({
        conversationId: 'conv-id-lead-duplicate',
        message: 'Sí',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
          consent: null,
          leadCreated: false,
        },
      });

      const response1 = await POST(req1);
      const data1 = await response1.json();
      expect(data1.leadUpdate.leadCreated).toBe(true);

      const req2 = makeMockRequest({
        conversationId: 'conv-id-lead-duplicate',
        message: 'Sí',
        history: [],
        lead: {
          state: 'awaiting_consent',
          name: 'Katherine',
          phone: '12403195266',
          consent: true,
          leadCreated: false,
        },
      });

      const fetchSpy = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = fetchSpy;

      const response2 = await POST(req2);
      const data2 = await response2.json();

      expect(data2.leadUpdate.leadCreated).toBe(false);
    });

    it('lead creation: prueba directa del repositorio AppsScriptLeadRepository', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ success: true }),
      });

      const repo = new AppsScriptLeadRepository();
      const success = await repo.createLead({
        conversationId: 'direct-repo-test-lead',
        name: 'Carlos Pérez',
        phone: '12403195266',
        consent: true,
        lastMessage: 'Mensaje de prueba directa',
      });

      expect(success).toBe(true);
    });
  });
});

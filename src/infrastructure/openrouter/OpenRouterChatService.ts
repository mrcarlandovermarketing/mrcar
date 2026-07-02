import { env } from '../config/env';
import { 
  OpenRouterError, 
  OpenRouterTimeoutError, 
  OpenRouterRateLimitError, 
  OpenRouterUnauthorizedError, 
  OpenRouterInvalidResponseError 
} from './errors';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Service to handle chat completion requests with the OpenRouter AI API.
 * Encapsulates HTTP headers, API keys, model selections, and timeout controls.
 */
export class OpenRouterChatService {
  async generateReply(messages: OpenRouterMessage[]): Promise<string> {
    if (!env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY.trim() === '') {
      throw new Error('La variable de entorno OPENROUTER_API_KEY no está configurada.');
    }

    const controller = new AbortController();
    // 20-second connection timeout guard
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.OPENROUTER_SITE_URL || 'http://localhost:3000',
          'X-Title': env.OPENROUTER_APP_NAME || 'MrCarWebApp',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: messages,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        throw new OpenRouterUnauthorizedError('El token de API de OpenRouter es inválido o no está autorizado.');
      }

      if (response.status === 429) {
        throw new OpenRouterRateLimitError('Límite de solicitudes de OpenRouter superado. Intente de nuevo en unos minutos.');
      }

      if (!response.ok) {
        throw new OpenRouterError(`Fallo en el servicio OpenRouter (HTTP ${response.status}).`);
      }

      interface OpenRouterResponsePayload {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      }

      const data = (await response.json()) as OpenRouterResponsePayload;
      
      if (!data || !data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new OpenRouterInvalidResponseError('La estructura del JSON retornado por OpenRouter es inválida.');
      }

      return data.choices[0].message.content || '';
    } catch (error) {
      clearTimeout(timeoutId);
      const isAbort = error && typeof error === 'object' && 'name' in error && (error as Record<string, unknown>).name === 'AbortError';
      if (isAbort) {
        throw new OpenRouterTimeoutError('El servicio de OpenRouter tardó demasiado en responder (Tiempo límite de 20s superado).');
      }
      if (error instanceof OpenRouterError) {
        throw error;
      }
      throw new OpenRouterError('Fallo de red o error inesperado al conectar con OpenRouter.', error);
    }
  }
}
export default OpenRouterChatService;

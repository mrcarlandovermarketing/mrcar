import { ConversationRepository, MessageData } from '@/domain/repositories/conversation-repository';
import { env } from '../config/env';

export class AppsScriptConversationRepository implements ConversationRepository {
  async saveMessage(message: MessageData): Promise<boolean> {
    if (!env.APPS_SCRIPT_API_URL) {
      console.warn('[AppsScriptConversationRepository] APPS_SCRIPT_API_URL no está configurada. Mensaje no guardado.');
      return false;
    }

    const payload = {
      action: 'saveMessage',
      apiSecret: env.APPS_SCRIPT_WRITE_SECRET,
      ...message,
    };

    try {
      const response = await fetch(env.APPS_SCRIPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`[AppsScriptConversationRepository] Error al guardar mensaje: HTTP ${response.status}`);
        return false;
      }

      const data = await response.json();
      return !!data.success;
    } catch (error) {
      // Non-blocking catch to ensure the chatbot response is still served normally
      console.error('[AppsScriptConversationRepository] Excepción de red al guardar mensaje:', error);
      return false;
    }
  }
}
export default AppsScriptConversationRepository;

import { KnowledgeRepository } from '@/domain/repositories/knowledge-repository';
import { env } from '../config/env';
import { AppsScriptNetworkError, AppsScriptUnavailableError } from './errors';

export class AppsScriptKnowledgeRepository implements KnowledgeRepository {
  async getKnowledge(): Promise<unknown> {
    if (!env.APPS_SCRIPT_API_URL) {
      return [];
    }

    const url = `${env.APPS_SCRIPT_API_URL}?action=knowledge`;
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        next: {
          revalidate: env.APPS_SCRIPT_REVALIDATE_SECONDS,
        },
      });
    } catch (error) {
      throw new AppsScriptNetworkError(
        'Fallo de conexión al intentar obtener la base de conocimientos.',
        error
      );
    }

    if (!response.ok) {
      throw new AppsScriptUnavailableError(
        `El servicio de conocimiento no está disponible (HTTP ${response.status}).`
      );
    }

    try {
      const data = await response.json();
      if (data && data.success) {
        return data.knowledge || data.data || [];
      }
      return [];
    } catch (e) {
      // Graceful empty fallback instead of crashing
      console.warn('[AppsScriptKnowledgeRepository] Fallo al parsear JSON de conocimiento:', e);
      return [];
    }
  }
}
export default AppsScriptKnowledgeRepository;

import { SettingsRepository } from '@/domain/repositories/settings-repository';
import { env } from '../config/env';
import { AppsScriptNetworkError, AppsScriptUnavailableError } from './errors';

export class AppsScriptSettingsRepository implements SettingsRepository {
  async getSettings(): Promise<Record<string, unknown>> {
    if (!env.APPS_SCRIPT_API_URL) {
      return {};
    }

    const url = `${env.APPS_SCRIPT_API_URL}?action=settings`;
    
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
        'Fallo de conexión al intentar obtener la configuración del sitio.',
        error
      );
    }

    if (!response.ok) {
      throw new AppsScriptUnavailableError(
        `El servicio de configuración no está disponible (HTTP ${response.status}).`
      );
    }

    try {
      const data = await response.json();
      if (data && data.success) {
        return data.settings || data.data || {};
      }
      return {};
    } catch (e) {
      console.warn('[AppsScriptSettingsRepository] Fallo al parsear JSON de configuración:', e);
      return {};
    }
  }
}
export default AppsScriptSettingsRepository;

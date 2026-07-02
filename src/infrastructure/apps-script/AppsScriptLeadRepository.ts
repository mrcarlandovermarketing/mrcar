import { LeadData, LeadRepository } from '@/domain/repositories/lead-repository';
import { env } from '../config/env';

export class AppsScriptLeadRepository implements LeadRepository {
  async createLead(lead: LeadData): Promise<boolean> {
    return this.saveLead(lead);
  }

  async saveLead(lead: LeadData): Promise<boolean> {
    if (!env.APPS_SCRIPT_API_URL) {
      console.warn('[AppsScriptLeadRepository] APPS_SCRIPT_API_URL no está configurada. Lead no guardado.');
      return false;
    }

    const payload = {
      action: 'saveLead',
      apiSecret: env.APPS_SCRIPT_WRITE_SECRET,
      ...lead,
    };

    try {
      const response = await fetch(env.APPS_SCRIPT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Do not cache write operations
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`[AppsScriptLeadRepository] Error al guardar lead: HTTP ${response.status}`);
        return false;
      }

      const data = await response.json();
      return !!data.success;
    } catch (error) {
      // Return false to avoid blocking the chat execution path if sheets write fails
      console.error('[AppsScriptLeadRepository] Excepción de red al guardar lead:', error);
      return false;
    }
  }
}
export default AppsScriptLeadRepository;

import { LeadData, LeadRepository } from '@/domain/repositories/lead-repository';
import { env } from '../config/env';

export class AppsScriptLeadRepository implements LeadRepository {
  async createLead(lead: LeadData): Promise<boolean> {
    return this.saveLead(lead);
  }

  async saveLead(lead: LeadData): Promise<boolean> {
    const apiUrl = env.APPS_SCRIPT_API_URL;
    const apiSecret = process.env.APPS_SCRIPT_WRITE_SECRET || env.APPS_SCRIPT_WRITE_SECRET || '';

    if (!apiUrl) {
      console.warn('[AppsScriptLeadRepository] APPS_SCRIPT_API_URL no está configurada. Lead no guardado.');
      return false;
    }

    const payload = {
      action: 'saveLead',
      apiSecret: apiSecret,
      conversationId: lead.conversationId,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      vehicleId: lead.vehicleId || '',
      vehicleInterest: lead.vehicleInterest || '',
      consent: lead.consent === true,
      lastMessage: lead.lastMessage || '',
    };

    console.log('[AppsScriptLeadRepository DEBUG]', {
      env: process.env.NODE_ENV || 'development',
      hasApiUrl: !!apiUrl,
      hasApiSecret: !!apiSecret,
      payloadKeys: Object.keys(payload),
    });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Do not cache write operations
        cache: 'no-store',
      });

      console.log('[AppsScriptLeadRepository DEBUG] HTTP Status:', response.status);

      if (!response.ok) {
        console.warn(`[AppsScriptLeadRepository] Error al guardar lead: HTTP ${response.status}`);
        return false;
      }

      const data = await response.json();
      console.log('[AppsScriptLeadRepository DEBUG] Response success:', data.success);
      return !!data.success;
    } catch (error) {
      // Return false to avoid blocking the chat execution path if sheets write fails
      console.error('[AppsScriptLeadRepository] Excepción de red al guardar lead:', error);
      return false;
    }
  }
}
export default AppsScriptLeadRepository;

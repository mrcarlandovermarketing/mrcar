export interface LeadData {
  conversationId: string;
  name: string;
  phone: string;
  email?: string;
  vehicleId?: string;
  vehicleInterest?: string;
  consent: boolean;
  lastMessage?: string;
}

export interface LeadRepository {
  /**
   * Saves a new lead/prospect to the persistent data store.
   * Returns true if successful.
   */
  saveLead(lead: LeadData): Promise<boolean>;
}

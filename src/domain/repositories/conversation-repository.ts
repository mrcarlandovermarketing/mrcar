export interface MessageData {
  conversationId: string;
  role: 'user' | 'assistant';
  message: string;
  vehicleId?: string;
  name?: string;
  phone?: string;
  clientMessageId?: string;
}

export interface ConversationRepository {
  /**
   * Saves an individual message exchange to the data store.
   * Returns true if successful.
   */
  saveMessage(message: MessageData): Promise<boolean>;
}

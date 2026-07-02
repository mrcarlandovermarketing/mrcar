export interface KnowledgeRepository {
  /**
   * Fetches general company knowledge, FAQs, or policies.
   * Returns a structured list or a pre-formatted string.
   */
  getKnowledge(): Promise<unknown>;
}

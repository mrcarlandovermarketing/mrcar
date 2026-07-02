export interface SettingsRepository {
  /**
   * Fetches public site settings and operational parameters.
   */
  getSettings(): Promise<Record<string, unknown>>;
}

import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleFilters, VehicleRepository } from '@/domain/repositories/vehicle-repository';
import { fetchAppsScriptVehicles } from './appsScriptClient';
import { appsScriptVehicleRowSchema } from './appsScriptVehicleResponse.schema';
import { mapAppsScriptVehicleToDomain } from './mapAppsScriptVehicleToDomain';
import { AppsScriptUnavailableError } from './errors';

export class AppsScriptVehicleRepository implements VehicleRepository {
  
  /**
   * Helper to sort vehicles:
   * 1. Featured first
   * 2. If both are featured (or both are not):
   *    - If both have an 'order' value (not null), sort by 'order' ascending
   *    - If one has 'order', it goes first
   *    - Fall back to publicationDate descending (newest first)
   */
  private sortVehicles(vehiclesList: Vehicle[]): Vehicle[] {
    return [...vehiclesList].sort((a, b) => {
      // 1. Featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // 2. Order sorting
      if (a.order !== null && b.order !== null) {
        return a.order - b.order;
      }
      if (a.order !== null && b.order === null) return -1;
      if (a.order === null && b.order !== null) return 1;

      // 3. Fallback to newest publication date first
      return b.publicationDate.getTime() - a.publicationDate.getTime();
    });
  }

  async getVehicles(): Promise<Vehicle[]> {
    const response = await fetchAppsScriptVehicles();
    
    if (!response.success) {
      throw new AppsScriptUnavailableError(
        'El servidor de Google Sheets reportó un fallo al consultar el catálogo.'
      );
    }

    const domainVehicles: Vehicle[] = [];
    const seenIds = new Set<string>();

    response.vehicles.forEach((rawItem, index) => {
      // Validate individual vehicle row
      const result = appsScriptVehicleRowSchema.safeParse(rawItem);
      
      if (!result.success) {
        // Warning on server, omitting details to protect privacy/security
        const rawId = (rawItem as Record<string, unknown>)?.ID || `Indice-${index}`;
        console.warn(
          `[AppsScriptVehicleRepository] Advertencia: Omitiendo vehículo inválido. Identificador: "${rawId}". Motivo:`,
          result.error.flatten().fieldErrors
        );
        return; // Skip invalid row
      }

      const row = result.data;

      // Check for duplicates
      if (seenIds.has(row.ID)) {
        console.warn(`[AppsScriptVehicleRepository] Advertencia: Detectado ID duplicado "${row.ID}". Omitiendo entrada posterior.`);
        return; // Skip duplicate
      }

      seenIds.add(row.ID);

      // Map to domain entity
      const vehicle = mapAppsScriptVehicleToDomain(row);

      // Apply filter: "Oculto" status vehicles must not be shown
      if (vehicle.status === 'Oculto') {
        return;
      }

      domainVehicles.push(vehicle);
    });

    return this.sortVehicles(domainVehicles);
  }

  async getFeaturedVehicles(): Promise<Vehicle[]> {
    const all = await this.getVehicles();
    return all.filter((v) => v.featured);
  }

  async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    const all = await this.getVehicles();
    const found = all.find((v) => v.slug === slug);
    return found || null;
  }

  async searchVehicles(query: string, filters?: VehicleFilters): Promise<Vehicle[]> {
    let result = await this.getVehicles();

    // 1. Text Search Query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(lowerQuery) ||
          v.model.toLowerCase().includes(lowerQuery) ||
          v.version.toLowerCase().includes(lowerQuery) ||
          v.description.toLowerCase().includes(lowerQuery) ||
          v.vin.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Apply Filters
    if (filters) {
      if (filters.brand) {
        const brandLower = filters.brand.toLowerCase();
        result = result.filter((v) => v.make.toLowerCase() === brandLower);
      }

      if (filters.status && filters.status.length > 0) {
        result = result.filter((v) => filters.status!.includes(v.status));
      }

      if (filters.minPrice !== undefined) {
        result = result.filter((v) => v.price !== null && v.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        result = result.filter((v) => v.price !== null && v.price <= filters.maxPrice!);
      }

      if (filters.minYear !== undefined) {
        result = result.filter((v) => v.year >= filters.minYear!);
      }

      if (filters.maxYear !== undefined) {
        result = result.filter((v) => v.year <= filters.maxYear!);
      }
    }

    return this.sortVehicles(result);
  }
}
export default AppsScriptVehicleRepository;

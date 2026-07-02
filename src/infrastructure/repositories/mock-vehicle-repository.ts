import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleFilters, VehicleRepository } from '@/domain/repositories/vehicle-repository';
import { mockVehicles } from '../data/mock-vehicles';

export class MockVehicleRepository implements VehicleRepository {
  private vehicles: Vehicle[] = mockVehicles;

  /**
   * Helper to sort vehicles: featured first, then by order, then by publicationDate descending
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

      // 3. Newest publication date first
      return b.publicationDate.getTime() - a.publicationDate.getTime();
    });
  }

  async getVehicles(): Promise<Vehicle[]> {
    // Filter out 'Oculto' status vehicles
    const activeVehicles = this.vehicles.filter((v) => v.status !== 'Oculto');
    return this.sortVehicles(activeVehicles);
  }

  async getFeaturedVehicles(): Promise<Vehicle[]> {
    // Only featured and not hidden
    const featuredList = this.vehicles.filter((v) => v.featured && v.status !== 'Oculto');
    return this.sortVehicles(featuredList);
  }

  async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    const vehicle = this.vehicles.find((v) => v.slug === slug);
    if (!vehicle || vehicle.status === 'Oculto') {
      return null;
    }
    return vehicle;
  }

  async searchVehicles(query: string, filters?: VehicleFilters): Promise<Vehicle[]> {
    let result = this.vehicles.filter((v) => v.status !== 'Oculto');

    // 1. Apply text search query
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

    // 2. Apply filters
    if (filters) {
      if (filters.brand) {
        const brandLower = filters.brand.toLowerCase();
        result = result.filter((v) => v.make.toLowerCase() === brandLower);
      }

      if (filters.status && filters.status.length > 0) {
        result = result.filter((v) => filters.status!.includes(v.status));
      }

      if (filters.minPrice !== undefined) {
        result = result.filter((v) => v.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        result = result.filter((v) => v.price <= filters.maxPrice!);
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
export default MockVehicleRepository;

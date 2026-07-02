import { Vehicle, VehicleStatus } from '../entities/vehicle';

export interface VehicleFilters {
  brand?: string;
  status?: VehicleStatus[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
}

export interface VehicleRepository {
  /**
   * Retrieves all vehicles that are not hidden (status !== 'Oculto').
   */
  getVehicles(): Promise<Vehicle[]>;

  /**
   * Retrieves featured vehicles, typically ordered by publish date or featured status.
   */
  getFeaturedVehicles(): Promise<Vehicle[]>;

  /**
   * Retrieves a single vehicle by its unique slug.
   * Returns null if not found or if the vehicle is 'Oculto'.
   */
  getVehicleBySlug(slug: string): Promise<Vehicle | null>;

  /**
   * Searches and filters vehicles.
   */
  searchVehicles(query: string, filters?: VehicleFilters): Promise<Vehicle[]>;
}

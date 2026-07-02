import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleRepository, VehicleFilters } from '@/domain/repositories/vehicle-repository';

export class SearchVehiclesUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute(query: string, filters?: VehicleFilters): Promise<Vehicle[]> {
    return this.vehicleRepository.searchVehicles(query, filters);
  }
}

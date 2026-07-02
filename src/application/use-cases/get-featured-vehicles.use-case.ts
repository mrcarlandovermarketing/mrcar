import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleRepository } from '@/domain/repositories/vehicle-repository';

export class GetFeaturedVehiclesUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute(): Promise<Vehicle[]> {
    return this.vehicleRepository.getFeaturedVehicles();
  }
}

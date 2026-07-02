import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleRepository } from '@/domain/repositories/vehicle-repository';

export class GetVehiclesUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute(): Promise<Vehicle[]> {
    return this.vehicleRepository.getVehicles();
  }
}

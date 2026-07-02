import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleRepository } from '@/domain/repositories/vehicle-repository';

export class GetVehicleBySlugUseCase {
  constructor(private vehicleRepository: VehicleRepository) {}

  async execute(slug: string): Promise<Vehicle | null> {
    return this.vehicleRepository.getVehicleBySlug(slug);
  }
}

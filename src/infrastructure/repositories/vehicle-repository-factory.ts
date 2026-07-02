import { VehicleRepository } from '@/domain/repositories/vehicle-repository';
import { MockVehicleRepository } from './mock-vehicle-repository';
import { AppsScriptVehicleRepository } from '../apps-script/AppsScriptVehicleRepository';
import { env } from '../config/env';

/**
 * Factory function to instantiate the active VehicleRepository implementation.
 * Decouples the application code (use cases) from concrete infrastructure providers.
 */
export function createVehicleRepository(): VehicleRepository {
  const source = env.VEHICLE_DATA_SOURCE;

  if (source === 'apps-script') {
    const apiMissing = !env.APPS_SCRIPT_API_URL || env.APPS_SCRIPT_API_URL.trim() === '';
    
    if (apiMissing) {
      const isDev = process.env.NODE_ENV === 'development';
      const allowDevFallback = process.env.ALLOW_DEV_FALLBACK === 'true';
      
      if (isDev && allowDevFallback) {
        console.warn(
          '[VehicleRepositoryFactory] Advertencia: APPS_SCRIPT_API_URL no está configurada. ' +
          'Se realiza fallback a MockVehicleRepository debido a la variable ALLOW_DEV_FALLBACK=true.'
        );
        return new MockVehicleRepository();
      }
      
      throw new Error(
        'Fallo de Configuración: APPS_SCRIPT_API_URL no está definida pero VEHICLE_DATA_SOURCE está ' +
        'establecida como "apps-script". Por favor, configure su variable de entorno.'
      );
    }

    return new AppsScriptVehicleRepository();
  }

  // Default to mock data source
  return new MockVehicleRepository();
}

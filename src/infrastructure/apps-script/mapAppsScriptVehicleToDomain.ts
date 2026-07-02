import { Vehicle, VehicleStatus } from '@/domain/entities/vehicle';
import { AppsScriptVehicleRow } from './appsScriptVehicleResponse.schema';

/**
 * Maps a validated Google Apps Script vehicle row to the domain Vehicle entity.
 * Implements fallback rules for main photo, photo array and SEO slugs.
 */
export function mapAppsScriptVehicleToDomain(row: AppsScriptVehicleRow): Vehicle {
  // 1. Photo fallback logic
  let mainPhoto = row.FOTO_PRINCIPAL?.trim() || '';
  let photos = [...row.FOTOS];

  if (!mainPhoto && photos.length > 0) {
    mainPhoto = photos[0];
  } else if (!mainPhoto && photos.length === 0) {
    mainPhoto = '/placeholders/vehicle-placeholder.png';
  }

  if (photos.length === 0 && mainPhoto && mainPhoto !== '/placeholders/vehicle-placeholder.png') {
    photos = [mainPhoto];
  }

  // 2. Slug fallback logic
  let slug = row.SLUG?.trim() || '';
  if (!slug) {
    const cleanMake = row.MARCA.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanModel = row.MODELO.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanYear = String(row.ANO);
    const cleanId = String(row.ID).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    slug = `${cleanMake}-${cleanModel}-${cleanYear}-${cleanId}`;
  }

  // 3. Date parsing logic
  let publicationDate = new Date();
  if (row.FECHA_DE_PUBLICACION) {
    const parsed = Date.parse(row.FECHA_DE_PUBLICACION);
    if (!isNaN(parsed)) {
      publicationDate = new Date(parsed);
    }
  }

  return {
    id: row.ID,
    slug,
    status: row.ESTADO as VehicleStatus,
    condition: row.CONDICION,
    featured: row.DESTACADO,
    make: row.MARCA,
    model: row.MODELO,
    version: row.VERSION,
    year: row.ANO,
    vehicleType: row.TIPO_VEHICULO,
    price: row.PRECIO,
    mileage: row.MILLAJE,
    exteriorColor: row.COLOR_EXTERIOR,
    interiorColor: row.COLOR_INTERIOR,
    transmission: row.TRANSMISION,
    fuel: row.COMBUSTIBLE,
    drivetrain: row.TRACCION,
    engine: row.MOTOR,
    displacement: row.CILINDRAJE,
    doors: row.PUERTAS,
    vin: row.VIN,
    stockNumber: row.STOCK_NUMBER,
    description: row.DESCRIPCION,
    features: row.CARACTERISTICAS,
    photos,
    mainPhoto,
    city: row.CIUDAD,
    state: row.ESTADO_USA,
    whatsapp: row.WHATSAPP,
    publicationDate,
    order: row.ORDEN ?? null,
  };
}

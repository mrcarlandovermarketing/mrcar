export type VehicleStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'Oculto';

export interface VehicleImage {
  url: string;
  isMain: boolean;
}

export interface Vehicle {
  id: string;
  slug: string;
  status: VehicleStatus;
  condition: string; // e.g. 'Nuevo', 'Usado', or ''
  featured: boolean;
  make: string;      // MARCA -> make
  model: string;
  version: string;
  year: number;
  vehicleType: string; // TIPO_VEHICULO -> vehicleType
  price: number | null;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  transmission: string;
  fuel: string;        // COMBUSTIBLE -> fuel
  drivetrain: string;  // TRACCION -> drivetrain
  engine: string;
  displacement: string; // CILINDRAJE -> displacement
  doors: number;
  vin: string;
  stockNumber: string; // STOCK_NUMBER -> stockNumber
  description: string;
  features: string[];
  photos: string[];
  mainPhoto: string;
  city: string;
  state: string;       // ESTADO_USA -> state
  whatsapp: string;    // WHATSAPP -> whatsapp
  publicationDate: Date; // FECHA_DE_PUBLICACION -> publicationDate
  order: number | null; // ORDEN -> order
}

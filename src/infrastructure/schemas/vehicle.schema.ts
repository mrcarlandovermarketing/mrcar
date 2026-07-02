import { z } from 'zod';
import { VehicleStatus } from '@/domain/entities/vehicle';

const statusSchema = z.enum(['Disponible', 'Reservado', 'Vendido', 'Oculto']);

// Helper to coerce string or number input into a clean number
const coerceNumber = z.union([z.number(), z.string()]).transform((val) => {
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
});

// Helper to coerce featured status ('SI' / 'NO', boolean, etc.) into boolean
const coerceBoolean = z.union([z.boolean(), z.string()]).transform((val) => {
  if (typeof val === 'boolean') return val;
  const normalized = val.trim().toUpperCase();
  return normalized === 'SI' || normalized === 'YES' || normalized === 'TRUE' || normalized === '1';
});

// Helper to split comma-separated strings into a clean array of strings
const commaStringToArray = z.union([z.array(z.string()), z.string()]).transform((val) => {
  if (Array.isArray(val)) return val;
  if (!val || !val.trim()) return [];
  return val.split(',').map((item) => item.trim()).filter(Boolean);
});

// Helper to coerce Date
const coerceDate = z.union([z.date(), z.string()]).transform((val) => {
  if (val instanceof Date) return val;
  const parsed = Date.parse(val);
  return isNaN(parsed) ? new Date() : new Date(parsed);
});

/**
 * Zod schema to validate and transform raw rows from the Google Sheet.
 * It transforms raw columns with Spanish names to the domain Vehicle entity.
 */
export const googleSheetsVehicleSchema = z.object({
  ID: z.union([z.string(), z.number()]).transform(String),
  ESTADO: statusSchema,
  DESTACADO: coerceBoolean,
  MARCA: z.string().min(1),
  MODELO: z.string().min(1),
  VERSIÓN: z.string().default(''),
  AÑO: coerceNumber,
  PRECIO: coerceNumber,
  MILLAJE: coerceNumber,
  "COLOR EXTERIOR": z.string().default(''),
  "COLOR INTERIOR": z.string().default(''),
  TRANSMISIÓN: z.string().default(''),
  COMBUSTIBLE: z.string().default(''),
  TRACCIÓN: z.string().default(''),
  MOTOR: z.string().default(''),
  PUERTAS: coerceNumber,
  VIN: z.string().min(1),
  DESCRIPCIÓN: z.string().default(''),
  CARACTERÍSTICAS: commaStringToArray,
  FOTOS: commaStringToArray,
  "FOTO PRINCIPAL": z.string().default(''),
  CIUDAD: z.string().default(''),
  "ESTADO USA": z.string().default(''),
  WHATSAPP: z.union([z.string(), z.number()]).transform(String).default(''),
  "FECHA DE PUBLICACIÓN": coerceDate,
}).transform((data) => {
  // Generate a SEO-friendly slug
  const cleanBrand = data.MARCA.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanModel = data.MODELO.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanYear = String(data.AÑO);
  const cleanId = String(data.ID).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const slug = `${cleanBrand}-${cleanModel}-${cleanYear}-${cleanId}`;

  return {
    id: data.ID,
    slug,
    status: data.ESTADO as VehicleStatus,
    condition: '', // Default empty for mock sheet rows
    featured: data.DESTACADO,
    make: data.MARCA,
    model: data.MODELO,
    version: data.VERSIÓN,
    year: data.AÑO,
    vehicleType: '', // Default empty for mock sheet rows
    price: data.PRECIO,
    mileage: data.MILLAJE,
    exteriorColor: data["COLOR EXTERIOR"],
    interiorColor: data["COLOR INTERIOR"],
    transmission: data.TRANSMISIÓN,
    fuel: data.COMBUSTIBLE,
    drivetrain: data.TRACCIÓN,
    engine: data.MOTOR,
    displacement: '',
    doors: data.PUERTAS,
    vin: data.VIN,
    stockNumber: '',
    description: data.DESCRIPCIÓN,
    features: data.CARACTERÍSTICAS,
    photos: data.FOTOS,
    mainPhoto: data["FOTO PRINCIPAL"] || '/placeholders/vehicle-placeholder.png',
    city: data.CIUDAD,
    state: data["ESTADO USA"],
    whatsapp: data.WHATSAPP,
    publicationDate: data["FECHA DE PUBLICACIÓN"],
    order: null,
  };
});

/**
 * Zod schema to validate a parsed Vehicle domain entity.
 */
export const vehicleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: statusSchema,
  condition: z.string(),
  featured: z.boolean(),
  make: z.string(),
  model: z.string(),
  version: z.string(),
  year: z.number(),
  vehicleType: z.string(),
  price: z.number(),
  mileage: z.number(),
  exteriorColor: z.string(),
  interiorColor: z.string(),
  transmission: z.string(),
  fuel: z.string(),
  drivetrain: z.string(),
  engine: z.string(),
  displacement: z.string(),
  doors: z.number(),
  vin: z.string(),
  stockNumber: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  photos: z.array(z.string()),
  mainPhoto: z.string(),
  city: z.string(),
  state: z.string(),
  whatsapp: z.string(),
  publicationDate: z.date(),
  order: z.number().nullable(),
});

export type RawSheetsVehicle = z.input<typeof googleSheetsVehicleSchema>;
export type DomainVehicle = z.infer<typeof vehicleSchema>;
export type GoogleSheetsRow = z.infer<typeof googleSheetsVehicleSchema>;
export const googleSheetsVehicleRowSchema = googleSheetsVehicleSchema; // Alias for safety

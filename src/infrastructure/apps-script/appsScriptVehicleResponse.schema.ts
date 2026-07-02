import { z } from 'zod';

const statusSchema = z.enum(['Disponible', 'Reservado', 'Vendido', 'Oculto']);

// Helper to coerce and clean optional strings that may be null, undefined, string, or number
const nullableStringSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  })
  .default('');

// Helper to coerce string arrays, comma-separated strings, null or undefined
const stringToArraySchema = z
  .union([
    z.array(z.string()),
    z.string(),
    z.null(),
    z.undefined()
  ])
  .transform((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      if (!val.trim()) return [];
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  })
  .default([]);

// Helper to coerce optional numbers that can be null or undefined
const coerceNumberOptional = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  })
  .default(0);

// Helper to coerce doors (defaults to 4 if null/undefined)
const coerceDoors = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return 4;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 4 : parsed;
  })
  .default(4);

// Helper to coerce booleans (handles true/false, 'SI'/'NO', 'YES'/'NO', etc.)
const coerceBoolean = z
  .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    const normalized = String(val).trim().toUpperCase();
    return normalized === 'SI' || normalized === 'YES' || normalized === 'TRUE' || normalized === '1';
  })
  .default(false);

/**
 * Validates a single vehicle row from Google Apps Script.
 * Ensures minimum properties (ID, MARCA, MODELO, ANO, PRECIO, ESTADO) are present and valid,
 * while accepting empty/missing/null optional attributes.
 */
export const appsScriptVehicleRowSchema = z.object({
  ID: z
    .union([z.string(), z.number()])
    .transform(String)
    .refine((val) => val.trim().length > 0, {
      message: 'ID cannot be empty',
    }),
  SLUG: nullableStringSchema,
  ESTADO: statusSchema,
  CONDICION: nullableStringSchema,
  DESTACADO: coerceBoolean,
  MARCA: z
    .union([z.string(), z.number()])
    .transform(String)
    .refine((val) => val.trim().length > 0, {
      message: 'MARCA (make) is required',
    }),
  MODELO: z
    .union([z.string(), z.number()])
    .transform(String)
    .refine((val) => val.trim().length > 0, {
      message: 'MODELO (model) is required',
    }),
  VERSION: nullableStringSchema,
  ANO: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const parsed = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 0 : parsed;
    })
    .refine((val) => val > 1900, {
      message: 'ANO (year) must be a valid year (> 1900)',
    }),
  TIPO_VEHICULO: nullableStringSchema,
  PRECIO: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const parsed = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    })
    .refine((val) => val >= 0, {
      message: 'PRECIO (price) must be positive',
    }),
  MILLAJE: coerceNumberOptional,
  COLOR_EXTERIOR: nullableStringSchema,
  COLOR_INTERIOR: nullableStringSchema,
  TRANSMISION: nullableStringSchema,
  COMBUSTIBLE: nullableStringSchema,
  TRACCION: nullableStringSchema,
  MOTOR: nullableStringSchema,
  CILINDRAJE: nullableStringSchema,
  PUERTAS: coerceDoors,
  VIN: nullableStringSchema,
  STOCK_NUMBER: nullableStringSchema,
  DESCRIPCION: nullableStringSchema,
  CARACTERISTICAS: stringToArraySchema,
  FOTOS: stringToArraySchema,
  FOTO_PRINCIPAL: nullableStringSchema,
  CIUDAD: nullableStringSchema,
  ESTADO_USA: nullableStringSchema,
  WHATSAPP: nullableStringSchema,
  FECHA_DE_PUBLICACION: nullableStringSchema,
  ORDEN: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'number') return val;
      const clean = String(val).trim();
      if (clean === '') return null;
      const parsed = parseInt(clean, 10);
      return isNaN(parsed) ? null : parsed;
    })
    .optional()
    .nullable()
    .default(null),
});

/**
 * Validates the top-level Google Apps Script response envelope.
 */
export const appsScriptApiResponseSchema = z.object({
  success: z.boolean(),
  version: z.string().optional().default('1.0.0'),
  vehicles: z.array(z.unknown()), // We validate rows one-by-one to maintain robustness
});

export type AppsScriptVehicleRow = z.infer<typeof appsScriptVehicleRowSchema>;
export type AppsScriptApiResponse = z.infer<typeof appsScriptApiResponseSchema>;
export type RawAppsScriptVehicleRow = z.input<typeof appsScriptVehicleRowSchema>;

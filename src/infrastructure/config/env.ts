import { z } from 'zod';

const envSchema = z.object({
  // Apps Script Settings
  APPS_SCRIPT_API_URL: z.string().url().optional().or(z.literal('')),
  VEHICLE_DATA_SOURCE: z.enum(['mock', 'apps-script']).default('mock'),
  APPS_SCRIPT_REVALIDATE_SECONDS: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(parsed) ? 300 : parsed;
    })
    .default(300),
  APPS_SCRIPT_WRITE_SECRET: z.string().optional().or(z.literal('')),

  // OpenRouter Settings
  OPENROUTER_API_KEY: z.string().optional().or(z.literal('')),
  OPENROUTER_MODEL: z.string().default('openrouter/free'),
  OPENROUTER_SITE_URL: z.string().optional().or(z.literal('')),
  OPENROUTER_APP_NAME: z.string().optional().or(z.literal('')),
});

const rawEnv = {
  APPS_SCRIPT_API_URL: process.env.APPS_SCRIPT_API_URL,
  VEHICLE_DATA_SOURCE: process.env.VEHICLE_DATA_SOURCE,
  APPS_SCRIPT_REVALIDATE_SECONDS: process.env.APPS_SCRIPT_REVALIDATE_SECONDS,
  APPS_SCRIPT_WRITE_SECRET: process.env.APPS_SCRIPT_WRITE_SECRET,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL,
  OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME,
};

const result = envSchema.safeParse(rawEnv);

if (!result.success) {
  console.error('Invalid environment variables:', result.error.format());
  throw new Error(`Configuración de entorno inválida: ${JSON.stringify(result.error.format())}`);
}

export const env = result.data;

// Live integration validation checks
if (env.VEHICLE_DATA_SOURCE === 'apps-script' && (!env.APPS_SCRIPT_API_URL || env.APPS_SCRIPT_API_URL.trim() === '')) {
  throw new Error('La variable de entorno APPS_SCRIPT_API_URL es requerida y debe ser una URL válida cuando VEHICLE_DATA_SOURCE está configurado como "apps-script".');
}

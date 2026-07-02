import { env } from '../config/env';
import { 
  AppsScriptNetworkError, 
  AppsScriptUnavailableError, 
  AppsScriptInvalidResponseError 
} from './errors';
import { appsScriptApiResponseSchema, AppsScriptApiResponse } from './appsScriptVehicleResponse.schema';

/**
 * Client to interact with the Google Apps Script Web App API.
 * Performs server-side fetches with caching configurations.
 */
export async function fetchAppsScriptVehicles(): Promise<AppsScriptApiResponse> {
  const url = `${env.APPS_SCRIPT_API_URL}?action=vehicles`;
  
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      next: {
        revalidate: env.APPS_SCRIPT_REVALIDATE_SECONDS,
      },
    });
  } catch (error) {
    throw new AppsScriptNetworkError(
      'Fallo de conexión de red al intentar conectar con el catálogo de Google Sheets.',
      error
    );
  }

  if (!response.ok) {
    throw new AppsScriptUnavailableError(
      `El servidor del catálogo no está disponible (Código de estado HTTP: ${response.status}).`
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new AppsScriptInvalidResponseError(
      'La respuesta recibida del servidor de catálogo no contiene un formato JSON válido.',
      error
    );
  }

  const result = appsScriptApiResponseSchema.safeParse(data);
  if (!result.success) {
    throw new AppsScriptInvalidResponseError(
      'La respuesta del servidor no coincide con el contrato de la API esperada.',
      result.error.format()
    );
  }

  return result.data;
}

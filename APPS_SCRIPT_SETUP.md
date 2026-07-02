# Configuración de Google Apps Script - Mr. Car

Este documento explica cómo configurar, depurar y desplegar la API de Google Apps Script para sincronizar el catálogo de vehículos en tiempo real con el archivo de Google Sheets.

---

## 1. Variables de Entorno (.env.local)

Para habilitar la sincronización en vivo, crea o edita el archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Define si se usa la base simulada local ('mock') o la API en vivo ('apps-script')
VEHICLE_DATA_SOURCE=apps-script

# URL de la aplicación web publicada de Google Apps Script
# IMPORTANTE: No debe llevar el prefijo NEXT_PUBLIC_ ya que se ejecuta solo en el servidor por seguridad.
APPS_SCRIPT_API_URL=https://script.google.com/macros/s/AKfycb.../exec

# Duración del caché de Next.js en segundos (ej. 300 = 5 minutos)
APPS_SCRIPT_REVALIDATE_SECONDS=300

# Permite fallback a datos mock en desarrollo si la URL está vacía (true/false)
ALLOW_DEV_FALLBACK=false
```

---

## 2. Pruebas de Diagnóstico y Estado (Endpoints)

Puedes verificar el estado del Apps Script realizando las siguientes peticiones HTTP en tu navegador o cliente API (como Postman):

### A. Prueba de Conexión Básica
* **URL**: `{APPS_SCRIPT_API_URL}?action=health`
* **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "status": "healthy",
    "timestamp": "2026-07-01T12:00:00.000Z"
  }
  ```

### B. Consulta de Inventario Completo
* **URL**: `{APPS_SCRIPT_API_URL}?action=vehicles`
* **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "version": "1.0.0",
    "vehicles": [
      {
        "ID": "hoacne2016",
        "MARCA": "Honda",
        "MODELO": "Accord",
        "ANO": 2016,
        "PRECIO": 15000,
        "ESTADO": "Disponible"
        // ...otros campos opcionales
      }
    ]
  }
  ```

---

## 3. Campos Obligatorios y Opcionales (Contrato del Sheet)

El validador de la infraestructura (**Zod**) en el servidor filtra y omite filas que no cumplan con la estructura mínima requerida para evitar errores de visualización.

### Campos Requeridos Mínimos (Zod fallará si faltan):
1. **ID**: Identificador único del vehículo (no puede ser vacío).
2. **MARCA**: Marca del fabricante (ej. `Toyota`).
3. **MODELO**: Modelo del vehículo (ej. `Corolla`).
4. **ANO**: Año de fabricación (mayor que `1900`).
5. **PRECIO**: Precio numérico (debe ser mayor o igual a `0`).
6. **ESTADO**: Debe corresponder exactamente a uno de los siguientes estados:
   * `Disponible`
   * `Reservado`
   * `Vendido`
   * `Oculto` (se filtra automáticamente y no se muestra en el catálogo).

### Campos Opcionales (Zod acepta valores vacíos o nulos):
* `VERSION`, `TIPO_VEHICULO`, `COLOR_EXTERIOR`, `COLOR_INTERIOR`, `TRANSMISION`, `COMBUSTIBLE`, `TRACCION`, `MOTOR`, `CILINDRAJE`, `PUERTAS`, `VIN`, `STOCK_NUMBER`, `DESCRIPCION`, `CARACTERISTICAS` (soporta arreglo o texto separado por comas), `FOTOS` (soporta arreglo o texto separado por comas), `FOTO_PRINCIPAL`, `CIUDAD`, `ESTADO_USA`, `WHATSAPP`, `FECHA_DE_PUBLICACION`, `ORDEN`.

---

## 4. Comportamiento del Caché e ISR

La aplicación web utiliza la directiva de caché nativa de Next.js (`fetch` con `next.revalidate`).
* **Duración**: Configurada por `APPS_SCRIPT_REVALIDATE_SECONDS` (defecto 5 minutos).
* **Manejo de Errores**: Si ocurre un error de red o el servidor de Google Sheets no responde, el sistema:
  1. Servirá la última versión del catálogo que tenga en caché de forma segura.
  2. Registrará el fallo en los logs del servidor.
  3. No cacheará errores por periodos prolongados, reintentando refrescar en las siguientes consultas.

---

## 5. Diagnóstico de Errores Comunes

1. **Catálogo Vacío o Vehículos Omitidos**:
   * Revisa los logs del servidor. Si un vehículo tiene campos vacíos obligatorios (como precio vacío o año menor a 1900), verás una advertencia indicando la omisión y el ID del vehículo.
2. **Error `AppsScriptConfigurationError`**:
   * Asegúrate de que `APPS_SCRIPT_API_URL` esté definida correctamente en `.env.local`.
   * Verifica que no tenga el prefijo `NEXT_PUBLIC_` para evitar fugas del endpoint en el frontend.
3. **Error `AppsScriptNetworkError`**:
   * Verifica tu conexión de red o si el script ha sido inhabilitado, pausado o superó la cuota diaria de cuotas de ejecución de Google.
4. **Fallas en la compilación (`npm run build`)**:
   * El factory de repositorios valida estrictamente las variables de entorno. Si `VEHICLE_DATA_SOURCE=apps-script` pero no hay URL y `ALLOW_DEV_FALLBACK` no está en `true` (o estás en entorno de producción), el build fallará de forma controlada.

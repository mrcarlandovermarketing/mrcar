# Plan de Proyecto - Mr. Car Automotive Group

Este documento describe las fases del proyecto para la creación y lanzamiento de la web de Mr. Car.

## Estado del Proyecto
* **Fase Actual**: Fase 3 - Conexión de Google Sheets (Completada).
* **Fase Siguiente**: Fase 4 - Chatbot Inteligente y Backend.

---

## Fases del Proyecto

### Fase 1: Arquitectura y Contratos de Datos (Completada)
* [x] Diseñar el modelo de datos de vehículo a partir de las columnas en Sheets.
* [x] Establecer una estructura de carpetas basada en Clean Architecture.
* [x] Crear entidades de Dominio (`Vehicle`, `VehicleRepository`).
* [x] Crear validador de datos de entrada con Zod (`vehicleSchema`).

### Fase 2: Interfaz Visual y Catálogo Mock (Completada)
* [x] Configurar el logo oficial `logomc.png` en Header, Footer y Chatbot.
* [x] Crear componentes reutilizables y responsivos (`BrandLogo`, `Header`, `Footer`).
* [x] Diseñar la sección Hero con confianza comunitaria e imagen de marca.
* [x] Desarrollar el buscador rápido e interactivo integrado con URL Query Params.
* [x] Implementar el catálogo de vehículos completo con filtros avanzados en drawer lateral (móvil/escritorio) y ordenamientos.
* [x] Crear la página individual de detalle del auto (`/vehiculo/[slug]`) con ficha técnica, VIN enmascarado, vehículos relacionados y alertas de estado.
* [x] Implementar la interfaz visual interactiva del Asistente Virtual (Chatbot) con respuestas simuladas de configuración.
* [x] Generar imágenes premium de marca para placeholders y secciones clave.
* [x] Validar que no existan errores de linting, tipos estricto o compilación Next.js.

### Fase 3: Integración de Google Sheets (Completada)
* [x] Crear variables de entorno en `.env.example` y `.env.local` con validación Zod.
* [x] Diseñar schemas de respuesta API e individual de fila con Zod (`appsScriptVehicleResponse.schema.ts`).
* [x] Implementar el cliente HTTP con caché revalidable en `appsScriptClient.ts`.
* [x] Desarrollar el mapeador de infraestructura a dominio (`mapAppsScriptVehicleToDomain.ts`) y sus fallbacks de imágenes/slugs.
* [x] Implementar `AppsScriptVehicleRepository` con descarte de filas corruptas, deduplicación e inyección de ordenamientos y estados.
* [x] Refactorizar la instanciación de repositorios con un Factory unificado (`vehicle-repository-factory.ts`) y soporte para fallbacks en desarrollo.
* [x] Escribir y validar el 100% de las pruebas unitarias con Vitest (12 pruebas exitosas).

### Fase 4: Chatbot Inteligente (Fase Siguiente)
* [ ] Conectar la interfaz de chat con un backend LLM (a través de OpenRouter u otra API).
* [ ] Desarrollar un sistema de contexto para que el bot conozca el inventario de vehículos real en tiempo real.
* [ ] Captura y guardado de leads y conversaciones de forma segura.

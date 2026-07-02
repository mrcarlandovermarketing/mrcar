# Modelo de Datos Oficial - Mr. Car

Este documento detalla el contrato de datos entre las respuestas JSON de la API de Google Apps Script y la entidad lógica `Vehicle` de nuestro dominio.

## Mapeo de Atributos (Apps Script API -> Dominio)

| Atributo en JSON API | Propiedad TypeScript | Tipo de Dato | Coerción / Transformación |
| :--- | :--- | :--- | :--- |
| **ID** | `id` | `string` | Requerido. Se convierte a string. |
| **SLUG** | `slug` | `string` | Opcional. Si está vacío, se genera a partir de Marca-Modelo-Año-ID. |
| **ESTADO** | `status` | `VehicleStatus`| Requerido. Enum: `'Disponible' \| 'Reservado' \| 'Vendido' \| 'Oculto'`. |
| **CONDICION** | `condition` | `string` | Opcional. Estado de uso (ej. `Nuevo`, `Usado`). |
| **DESTACADO** | `featured` | `boolean` | Coerción: `true`/`false`, `'SI'`/`'NO'`, `1`/`0`. |
| **MARCA** | `make` | `string` | Requerido. Marca del fabricante (ej. `Honda`). |
| **MODELO** | `model` | `string` | Requerido. Modelo del vehículo (ej. `Accord`). |
| **VERSION** | `version` | `string` | Opcional (defecto a `''`). |
| **ANO** | `year` | `number` | Requerido. Año de fabricación (mayor a `1900`). |
| **TIPO_VEHICULO** | `vehicleType` | `string` | Opcional. Tipo de carrocería (ej. `Sedán`, `SUV`). |
| **PRECIO** | `price` | `number` | Requerido. Debe ser mayor o igual a `0`. |
| **MILLAJE** | `mileage` | `number` | Opcional (defecto a `0`). |
| **COLOR_EXTERIOR** | `exteriorColor` | `string` | Opcional (defecto a `''`). |
| **COLOR_INTERIOR** | `interiorColor` | `string` | Opcional (defecto a `''`). |
| **TRANSMISION** | `transmission` | `string` | Opcional (defecto a `''`). |
| **COMBUSTIBLE** | `fuel` | `string` | Opcional (defecto a `''`). |
| **TRACCION** | `drivetrain` | `string` | Opcional (defecto a `''`). |
| **MOTOR** | `engine` | `string` | Opcional (defecto a `''`). |
| **CILINDRAJE** | `displacement` | `string` | Opcional. Desplazamiento del motor (ej. `2400` o `2.4L`). |
| **PUERTAS** | `doors` | `number` | Opcional (defecto a `4`). |
| **VIN** | `vin` | `string` | Opcional. Número de chasis (17 caracteres). |
| **STOCK_NUMBER** | `stockNumber` | `string` | Opcional. Número de lote o control de inventario. |
| **DESCRIPCION** | `description` | `string` | Opcional (defecto a `''`). |
| **CARACTERISTICAS**| `features` | `string[]` | Soporta arreglo o texto plano separado por comas. |
| **FOTOS** | `photos` | `string[]` | Soporta arreglo o texto plano separado por comas. |
| **FOTO_PRINCIPAL** | `mainPhoto` | `string` | URL principal. Aplica reglas de fallback automáticas. |
| **CIUDAD** | `city` | `string` | Opcional (defecto a `''`). |
| **ESTADO_USA** | `state` | `string` | Opcional (defecto a `''`). |
| **WHATSAPP** | `whatsapp` | `string` | Opcional. Número de contacto de WhatsApp para cotizar. |
| **FECHA_DE_PUBLICACION** | `publicationDate` | `Date` | Opcional. Objeto de fecha de JS. |
| **ORDEN** | `order` | `number \| null`| Opcional. Índice numérico para forzar orden en catálogo. |

---

## Reglas Especiales de Fallback de Fotos

Para garantizar la estabilidad visual de la UI y prevenir imágenes rotas, la capa de infraestructura aplica tres reglas estrictas al procesar las fotos:

1. **FOTO_PRINCIPAL vacía**: Si la propiedad `FOTO_PRINCIPAL` no está presente o está en blanco, pero el arreglo `FOTOS` contiene enlaces, se tomará el primer enlace de `FOTOS` como la foto principal.
2. **Ambas vacías**: Si no hay `FOTO_PRINCIPAL` ni imágenes en `FOTOS`, se inyectará por defecto el placeholder local `/placeholders/vehicle-placeholder.png`.
3. **FOTOS vacías pero FOTO_PRINCIPAL presente**: Si existe una foto principal pero el listado de fotos está vacío, se creará un arreglo `photos` que contenga únicamente esa imagen principal, permitiendo el renderizado correcto en carruseles y detalles del vehículo.

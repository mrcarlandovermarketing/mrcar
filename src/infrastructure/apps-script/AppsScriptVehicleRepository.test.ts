import { describe, it, expect, vi, afterEach } from 'vitest';
import { createVehicleRepository } from '../repositories/vehicle-repository-factory';
import { MockVehicleRepository } from '../repositories/mock-vehicle-repository';
import { AppsScriptVehicleRepository } from './AppsScriptVehicleRepository';
import { mapAppsScriptVehicleToDomain } from './mapAppsScriptVehicleToDomain';
import { appsScriptVehicleRowSchema } from './appsScriptVehicleResponse.schema';
import { AppsScriptUnavailableError, AppsScriptInvalidResponseError } from './errors';

// Helper to mock global fetch response
function mockFetchResponse(status: number, data: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => data,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('Mapeo de Vehículos (mapAppsScriptVehicleToDomain)', () => {
  it('debe mapear correctamente todos los campos de Apps Script al dominio de la entidad', () => {
    const rawRow = {
      ID: 'test-id-1',
      SLUG: 'honda-accord-2016-hoacne2016',
      ESTADO: 'Disponible' as const,
      CONDICION: 'Usado',
      DESTACADO: true,
      MARCA: 'Honda',
      MODELO: 'Accord',
      VERSION: 'Sedan',
      ANO: 2016,
      TIPO_VEHICULO: 'Sedan',
      PRECIO: 15000,
      MILLAJE: 156041,
      COLOR_EXTERIOR: 'Negro',
      COLOR_INTERIOR: 'Gris',
      TRANSMISION: 'Automática',
      COMBUSTIBLE: 'Gasolina',
      TRACCION: 'FWD',
      MOTOR: '2.4L',
      CILINDRAJE: '2400',
      PUERTAS: 4,
      VIN: '1HGCR2F82GA201626',
      STOCK_NUMBER: 'ST-100',
      DESCRIPCION: 'Prueba Accord',
      CARACTERISTICAS: ['A/C', 'Bluetooth'],
      FOTOS: ['url1', 'url2'],
      FOTO_PRINCIPAL: 'url-main',
      CIUDAD: 'Miami',
      ESTADO_USA: 'FL',
      WHATSAPP: '13055550199',
      FECHA_DE_PUBLICACION: '2026-07-01T12:00:00Z',
      ORDEN: 1,
    };

    const validated = appsScriptVehicleRowSchema.parse(rawRow);
    const domainVehicle = mapAppsScriptVehicleToDomain(validated);

    expect(domainVehicle.id).toBe('test-id-1');
    expect(domainVehicle.slug).toBe('honda-accord-2016-hoacne2016');
    expect(domainVehicle.status).toBe('Disponible');
    expect(domainVehicle.condition).toBe('Usado');
    expect(domainVehicle.featured).toBe(true);
    expect(domainVehicle.make).toBe('Honda');
    expect(domainVehicle.model).toBe('Accord');
    expect(domainVehicle.version).toBe('Sedan');
    expect(domainVehicle.year).toBe(2016);
    expect(domainVehicle.vehicleType).toBe('Sedan');
    expect(domainVehicle.price).toBe(15000);
    expect(domainVehicle.mileage).toBe(156041);
    expect(domainVehicle.exteriorColor).toBe('Negro');
    expect(domainVehicle.interiorColor).toBe('Gris');
    expect(domainVehicle.transmission).toBe('Automática');
    expect(domainVehicle.fuel).toBe('Gasolina');
    expect(domainVehicle.drivetrain).toBe('FWD');
    expect(domainVehicle.engine).toBe('2.4L');
    expect(domainVehicle.displacement).toBe('2400');
    expect(domainVehicle.doors).toBe(4);
    expect(domainVehicle.vin).toBe('1HGCR2F82GA201626');
    expect(domainVehicle.stockNumber).toBe('ST-100');
    expect(domainVehicle.description).toBe('Prueba Accord');
    expect(domainVehicle.features).toEqual(['A/C', 'Bluetooth']);
    expect(domainVehicle.photos).toEqual(['url1', 'url2']);
    expect(domainVehicle.mainPhoto).toBe('url-main');
    expect(domainVehicle.city).toBe('Miami');
    expect(domainVehicle.state).toBe('FL');
    expect(domainVehicle.whatsapp).toBe('13055550199');
    expect(domainVehicle.publicationDate).toBeInstanceOf(Date);
    expect(domainVehicle.order).toBe(1);
  });

  it('debe aplicar fallback de FOTO_PRINCIPAL usando la primera de FOTOS si está vacía', () => {
    const rawRow = {
      ID: 'test-id-2',
      ESTADO: 'Disponible' as const,
      MARCA: 'Toyota',
      MODELO: 'Yaris',
      ANO: 2018,
      PRECIO: 12000,
      FOTOS: ['url-foto-1', 'url-foto-2'],
      FOTO_PRINCIPAL: '',
      VIN: 'VIN-YARIS',
    };

    const validated = appsScriptVehicleRowSchema.parse(rawRow);
    const domainVehicle = mapAppsScriptVehicleToDomain(validated);

    expect(domainVehicle.mainPhoto).toBe('url-foto-1');
    expect(domainVehicle.photos).toEqual(['url-foto-1', 'url-foto-2']);
  });

  it('debe aplicar el placeholder local si FOTO_PRINCIPAL y FOTOS están vacíos', () => {
    const rawRow = {
      ID: 'test-id-3',
      ESTADO: 'Disponible' as const,
      MARCA: 'Toyota',
      MODELO: 'Yaris',
      ANO: 2018,
      PRECIO: 12000,
      FOTOS: [],
      FOTO_PRINCIPAL: '',
      VIN: 'VIN-YARIS',
    };

    const validated = appsScriptVehicleRowSchema.parse(rawRow);
    const domainVehicle = mapAppsScriptVehicleToDomain(validated);

    expect(domainVehicle.mainPhoto).toBe('/placeholders/vehicle-placeholder.png');
    expect(domainVehicle.photos).toEqual([]);
  });

  it('debe poblar photos conteniendo FOTO_PRINCIPAL como único elemento si FOTOS está vacío', () => {
    const rawRow = {
      ID: 'test-id-4',
      ESTADO: 'Disponible' as const,
      MARCA: 'Toyota',
      MODELO: 'Yaris',
      ANO: 2018,
      PRECIO: 12000,
      FOTOS: [],
      FOTO_PRINCIPAL: 'url-single-main',
      VIN: 'VIN-YARIS',
    };

    const validated = appsScriptVehicleRowSchema.parse(rawRow);
    const domainVehicle = mapAppsScriptVehicleToDomain(validated);

    expect(domainVehicle.mainPhoto).toBe('url-single-main');
    expect(domainVehicle.photos).toEqual(['url-single-main']);
  });

  it('debe permitir PRECIO nulo, indefinido o vacío y mapearlo a null en la entidad de dominio', () => {
    const rawRow1 = {
      ID: 'test-price-null-1',
      ESTADO: 'Disponible' as const,
      MARCA: 'Toyota',
      MODELO: 'Yaris',
      ANO: 2018,
      PRECIO: null,
      FOTOS: [],
      FOTO_PRINCIPAL: '',
      VIN: 'VIN-YARIS',
    };

    const rawRow2 = {
      ID: 'test-price-null-2',
      ESTADO: 'Disponible' as const,
      MARCA: 'Toyota',
      MODELO: 'Yaris',
      ANO: 2018,
      PRECIO: '',
      FOTOS: [],
      FOTO_PRINCIPAL: '',
      VIN: 'VIN-YARIS',
    };

    const validated1 = appsScriptVehicleRowSchema.parse(rawRow1);
    const domainVehicle1 = mapAppsScriptVehicleToDomain(validated1);
    expect(domainVehicle1.price).toBeNull();

    const validated2 = appsScriptVehicleRowSchema.parse(rawRow2);
    const domainVehicle2 = mapAppsScriptVehicleToDomain(validated2);
    expect(domainVehicle2.price).toBeNull();
  });
});

describe('AppsScriptVehicleRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe procesar exitosamente un JSON válido retornando vehículos mapeados y ordenados', async () => {
    const mockApiResponse = {
      success: true,
      version: '1.0.0',
      vehicles: [
        {
          ID: 'v-1',
          ESTADO: 'Disponible',
          DESTACADO: false,
          MARCA: 'Toyota',
          MODELO: 'Corolla',
          ANO: 2020,
          PRECIO: 16000,
          VIN: 'VIN-COROLLA',
          FECHA_DE_PUBLICACION: '2026-07-01T00:00:00Z',
          ORDEN: 2,
        },
        {
          ID: 'v-2',
          ESTADO: 'Disponible',
          DESTACADO: true, // featured should sort first
          MARCA: 'Honda',
          MODELO: 'Accord',
          ANO: 2016,
          PRECIO: 15000,
          VIN: 'VIN-ACCORD',
          FECHA_DE_PUBLICACION: '2026-06-01T00:00:00Z',
          ORDEN: 1,
        }
      ]
    };

    mockFetchResponse(200, mockApiResponse);
    const repo = new AppsScriptVehicleRepository();
    const result = await repo.getVehicles();

    expect(result).toHaveLength(2);
    // Featured first check
    expect(result[0].id).toBe('v-2');
    expect(result[0].make).toBe('Honda');
    expect(result[1].id).toBe('v-1');
    expect(result[1].make).toBe('Toyota');
  });

  it('debe lanzar AppsScriptUnavailableError si success es false', async () => {
    const mockApiResponse = {
      success: false,
      vehicles: []
    };

    mockFetchResponse(200, mockApiResponse);
    const repo = new AppsScriptVehicleRepository();

    await expect(repo.getVehicles()).rejects.toThrow(AppsScriptUnavailableError);
  });

  it('debe lanzar AppsScriptInvalidResponseError si el formato de red no coincide con el schema de sobre', async () => {
    const mockApiResponse = {
      success: 'not-a-boolean', // fails validation
      vehicles: []
    };

    mockFetchResponse(200, mockApiResponse);
    const repo = new AppsScriptVehicleRepository();

    await expect(repo.getVehicles()).rejects.toThrow(AppsScriptInvalidResponseError);
  });

  it('debe omitir filas individuales que fallen validaciones mínimas de Zod sin tumbar todo el catálogo', async () => {
    const mockApiResponse = {
      success: true,
      vehicles: [
        {
          ID: 'valido-1',
          ESTADO: 'Disponible',
          MARCA: 'Mazda',
          MODELO: '3',
          ANO: 2018,
          PRECIO: 14000,
          VIN: 'VIN-MAZDA',
          FECHA_DE_PUBLICACION: '2026-07-02T00:00:00Z',
        },
        {
          ID: 'invalido-2',
          ESTADO: 'Disponible',
          MARCA: '', // invalid (required string cannot be empty)
          MODELO: 'Camry',
          ANO: 2012,
          PRECIO: 12000,
          VIN: 'VIN-CAMRY',
        },
        {
          ID: 'valido-3',
          ESTADO: 'Disponible',
          MARCA: 'Nissan',
          MODELO: 'Sentra',
          ANO: 2019,
          PRECIO: 11000,
          VIN: 'VIN-NISSAN',
          FECHA_DE_PUBLICACION: '2026-07-01T00:00:00Z',
        }
      ]
    };

    mockFetchResponse(200, mockApiResponse);
    const repo = new AppsScriptVehicleRepository();
    
    // Silence console.warn logs in test results
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await repo.getVehicles();

    expect(result).toHaveLength(2);
    expect(result.map(v => v.id)).toEqual(['valido-1', 'valido-3']);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('debe filtrar vehículos que tengan estado "Oculto"', async () => {
    const mockApiResponse = {
      success: true,
      vehicles: [
        {
          ID: 'oculto-1',
          ESTADO: 'Oculto', // Oculto must be filtered out
          MARCA: 'Ford',
          MODELO: 'Mustang',
          ANO: 2018,
          PRECIO: 30000,
          VIN: 'VIN-MUSTANG',
        },
        {
          ID: 'visible-2',
          ESTADO: 'Disponible',
          MARCA: 'Ford',
          MODELO: 'Explorer',
          ANO: 2019,
          PRECIO: 25000,
          VIN: 'VIN-EXPLORER',
        }
      ]
    };

    mockFetchResponse(200, mockApiResponse);
    const repo = new AppsScriptVehicleRepository();
    const result = await repo.getVehicles();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('visible-2');
  });

  it('debe ignorar vehículos con IDs duplicados de forma segura', async () => {
    const mockApiResponse = {
      success: true,
      vehicles: [
        {
          ID: 'dup-1',
          ESTADO: 'Disponible',
          MARCA: 'Toyota',
          MODELO: 'Prius',
          ANO: 2017,
          PRECIO: 15000,
          VIN: 'VIN-PRIUS',
        },
        {
          ID: 'dup-1', // duplicate ID
          ESTADO: 'Disponible',
          MARCA: 'Toyota',
          MODELO: 'Prius',
          ANO: 2017,
          PRECIO: 15500,
          VIN: 'VIN-PRIUS-DUPLICATE',
        }
      ]
    };

    mockFetchResponse(200, mockApiResponse);
    const repo = new AppsScriptVehicleRepository();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = await repo.getVehicles();

    expect(result).toHaveLength(1);
    expect(result[0].vin).toBe('VIN-PRIUS'); // keeps the first one
    warnSpy.mockRestore();
  });
});

describe('MockVehicleRepository', () => {
  it('debe devolver los vehículos simulados activos correctamente y filtrar los ocultos', async () => {
    const repo = new MockVehicleRepository();
    const list = await repo.getVehicles();
    
    expect(list.length).toBeGreaterThan(0);
    // No vehicle in list should be Oculto
    const hasHidden = list.some((v) => v.status === 'Oculto');
    expect(hasHidden).toBe(false);
  });
});

describe('VehicleRepositoryFactory', () => {
  it('debe devolver MockVehicleRepository si la configuración por defecto es "mock"', () => {
    // When default config is set, factory resolves Mock repository
    const repo = createVehicleRepository();
    expect(repo).toBeInstanceOf(MockVehicleRepository);
  });
});

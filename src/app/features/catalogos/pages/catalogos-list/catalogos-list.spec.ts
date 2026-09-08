import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogosList } from './catalogos-list';
import { Catalogos } from '../../services/catalogos';
import { Toast } from '../../../../core/services/toast';
import type { Tecnico, TipoServicio } from '../../../solicitudes/models/solicitud';

// Mock de ResizeObserver para PrimeNG Tabs en entorno JSDOM
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe(): void { }
    unobserve(): void { }
    disconnect(): void { }
  } as unknown as typeof ResizeObserver;
}

describe('CatalogosList', () => {
  let component: CatalogosList;
  let fixture: ComponentFixture<CatalogosList>;

  const mockTecnicos: readonly Tecnico[] = [
    {
      id: 1,
      nombreCompleto: 'Pedro Pérez',
      documento: '1020304050',
      email: 'pedro.perez@empresa.com',
      telefono: '3001112233',
      activo: true,
    },
    {
      id: 2,
      nombreCompleto: 'Ana Gómez',
      documento: '1020304051',
      email: 'ana.gomez@empresa.com',
      telefono: null,
      activo: false,
    },
  ];

  const mockTipos: readonly TipoServicio[] = [
    {
      id: 1,
      nombre: 'Mantenimiento de Equipo',
      descripcion: 'Soporte preventivo y correctivo',
      activo: true,
    },
    {
      id: 2,
      nombre: 'Soporte de Red',
      descripcion: 'Conectividad y VPN',
      activo: false,
    },
  ];

  const mockCatalogos = {
    listarTecnicos: vi.fn().mockReturnValue(of(mockTecnicos)),
    listarTiposServicio: vi.fn().mockReturnValue(of(mockTipos)),
  };

  const mockToast = {
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    errorApi: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogosList],
      providers: [
        { provide: Catalogos, useValue: mockCatalogos },
        { provide: Toast, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogosList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar los catálogos al inicializar', () => {
    expect(component).toBeTruthy();
    expect(mockCatalogos.listarTecnicos).toHaveBeenCalled();
    expect(mockCatalogos.listarTiposServicio).toHaveBeenCalled();
    expect(component['tecnicos']().length).toBe(2);
    expect(component['tiposServicio']().length).toBe(2);
  });

  it('debe calcular métricas correctamente', () => {
    expect(component['totalTecnicos']()).toBe(2);
    expect(component['tecnicosActivos']()).toBe(1);
    expect(component['totalTipos']()).toBe(2);
    expect(component['tiposActivos']()).toBe(1);
  });

  it('debe filtrar técnicos por búsqueda de texto y estado', () => {
    // Filtro por nombre
    component['busquedaTecnicos'].set('Pedro');
    expect(component['tecnicosFiltrados']().length).toBe(1);
    expect(component['tecnicosFiltrados']()[0].nombreCompleto).toBe('Pedro Pérez');

    // Filtro por documento
    component['busquedaTecnicos'].set('1020304051');
    expect(component['tecnicosFiltrados']().length).toBe(1);
    expect(component['tecnicosFiltrados']()[0].nombreCompleto).toBe('Ana Gómez');

    // Filtro por estado activo
    component['busquedaTecnicos'].set('');
    component['estadoTecnicos'].set(true);
    expect(component['tecnicosFiltrados']().length).toBe(1);
    expect(component['tecnicosFiltrados']()[0].activo).toBe(true);

    // Limpiar filtros
    component.limpiarFiltrosTecnicos();
    expect(component['tecnicosFiltrados']().length).toBe(2);
  });

  it('debe filtrar tipos de servicio por búsqueda y estado', () => {
    // Búsqueda por nombre
    component['busquedaTipos'].set('Red');
    expect(component['tiposFiltrados']().length).toBe(1);
    expect(component['tiposFiltrados']()[0].nombre).toBe('Soporte de Red');

    // Filtro por inactivos
    component['busquedaTipos'].set('');
    component['estadoTipos'].set(false);
    expect(component['tiposFiltrados']().length).toBe(1);
    expect(component['tiposFiltrados']()[0].activo).toBe(false);

    // Limpiar filtros
    component.limpiarFiltrosTipos();
    expect(component['tiposFiltrados']().length).toBe(2);
  });

  it('debe cambiar de pestaña', () => {
    component.cambiarTab('servicios');
    expect(component['tabActiva']()).toBe('servicios');
  });
});

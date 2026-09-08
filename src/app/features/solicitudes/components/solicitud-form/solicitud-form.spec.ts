import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { SolicitudForm } from './solicitud-form';
import type { Solicitud, TipoServicio } from '../../models/solicitud';

const TIPOS_A: TipoServicio[] = [
  { id: 1, nombre: 'Impresoras', descripcion: null, activo: true },
];
const TIPOS_B: TipoServicio[] = [
  ...TIPOS_A,
  { id: 2, nombre: 'Redes', descripcion: null, activo: true },
];

const SOLICITUD: Solicitud = {
  id: 7,
  codigo: 'SOL-000007',
  titulo: 'PC no enciende',
  descripcion: 'El equipo del área no responde al botón.',
  solicitanteNombre: 'Ana Ruiz',
  solicitanteEmail: 'ana@empresa.com',
  solicitanteArea: null,
  estado: 'PENDIENTE',
  prioridad: 'ALTA',
  fechaSolicitud: '2026-01-01T00:00:00.000Z',
  fechaAsignacion: null,
  fechaCierre: null,
  tipoServicio: { id: 1, nombre: 'Impresoras' },
  tecnico: null,
};

describe('SolicitudForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudForm],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  async function abrirEnCrear() {
    const fixture = TestBed.createComponent(SolicitudForm);
    fixture.componentRef.setInput('solicitud', null);
    fixture.componentRef.setInput('tipos', TIPOS_A);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create the form', async () => {
    const fixture = await abrirEnCrear();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no debe borrar lo digitado cuando llegan tarde los tipos o cambian señales', async () => {
    const fixture = await abrirEnCrear();
    const form = fixture.componentInstance['form'] as unknown as {
      controls: Record<string, { setValue(v: unknown): void; value: unknown }>;
    };
    form.controls['titulo'].setValue('Impresora sin tóner');
    form.controls['tipoServicioId'].setValue(1);
    fixture.detectChanges();

    // Llegada tardía / nueva referencia de tipos (el caso del bug reportado)
    fixture.componentRef.setInput('tipos', TIPOS_B);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(form.controls['titulo'].value).toBe('Impresora sin tóner');
    expect(form.controls['tipoServicioId'].value).toBe(1);
  });

  it('en edición parchea una vez y conserva valores ante cambios de tipos', async () => {
    const fixture = TestBed.createComponent(SolicitudForm);
    fixture.componentRef.setInput('solicitud', SOLICITUD);
    fixture.componentRef.setInput('tipos', TIPOS_A);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.componentInstance['form'] as unknown as {
      controls: Record<string, { value: unknown }>;
    };
    expect(form.controls['titulo'].value).toBe('PC no enciende');

    fixture.componentRef.setInput('tipos', TIPOS_B);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.controls['titulo'].value).toBe('PC no enciende');
    expect(form.controls['tipoServicioId'].value).toBe(1);
  });
});

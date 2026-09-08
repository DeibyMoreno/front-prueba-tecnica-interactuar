import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { Toast } from '../../../../core/services/toast';
import { EmptyState } from '../../../../shared/components/empty-state';
import { PageHeader } from '../../../../shared/components/page-header';
import type { Tecnico, TipoServicio } from '../../../solicitudes/models/solicitud';
import { Catalogos } from '../../services/catalogos';

interface OpcionFiltroEstado {
  readonly label: string;
  readonly value: boolean | null;
}

/**
 * Vista de consulta para entidades base del sistema (Tablas Maestras):
 * - Directorio de técnicos asignables.
 * - Catálogo de tipos de solicitudes / servicios de TI.
 */
@Component({
  selector: 'ti-catalogos-list',
  imports: [
    FormsModule,
    TabsModule,
    TableModule,
    Button,
    InputText,
    Select,
    Tag,
    PageHeader,
    EmptyState,
  ],
  templateUrl: './catalogos-list.html',
  styleUrl: './catalogos-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogosList implements OnInit {
  private readonly catalogos = inject(Catalogos);
  private readonly toast = inject(Toast);

  // Pestaña activa
  protected readonly tabActiva = signal<string | number>('tecnicos');

  // Datos base
  protected readonly tecnicos = signal<readonly Tecnico[]>([]);
  protected readonly tiposServicio = signal<readonly TipoServicio[]>([]);

  // Estados de carga
  protected readonly cargandoTecnicos = signal<boolean>(false);
  protected readonly cargandoTipos = signal<boolean>(false);

  // Filtros de Técnicos
  protected readonly busquedaTecnicos = signal<string>('');
  protected readonly estadoTecnicos = signal<boolean | null>(null);

  // Filtros de Tipos de Servicio
  protected readonly busquedaTipos = signal<string>('');
  protected readonly estadoTipos = signal<boolean | null>(null);

  // Opciones de selector de estado
  protected readonly opcionesEstado: OpcionFiltroEstado[] = [
    { label: 'Todos los estados', value: null },
    { label: 'Solo activos', value: true },
    { label: 'Solo inactivos', value: false },
  ];

  // Listas filtradas reactivamente
  protected readonly tecnicosFiltrados = computed(() => {
    const query = this.busquedaTecnicos().trim().toLowerCase();
    const estado = this.estadoTecnicos();

    return this.tecnicos().filter((t) => {
      const cumpleEstado = estado === null || t.activo === estado;
      if (!cumpleEstado) return false;
      if (!query) return true;

      return (
        t.nombreCompleto.toLowerCase().includes(query) ||
        t.documento.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query) ||
        (t.telefono && t.telefono.toLowerCase().includes(query))
      );
    });
  });

  protected readonly tiposFiltrados = computed(() => {
    const query = this.busquedaTipos().trim().toLowerCase();
    const estado = this.estadoTipos();

    return this.tiposServicio().filter((s) => {
      const cumpleEstado = estado === null || s.activo === estado;
      if (!cumpleEstado) return false;
      if (!query) return true;

      return (
        s.nombre.toLowerCase().includes(query) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(query))
      );
    });
  });

  // Métricas
  protected readonly totalTecnicos = computed(() => this.tecnicos().length);
  protected readonly tecnicosActivos = computed(
    () => this.tecnicos().filter((t) => t.activo).length
  );
  protected readonly totalTipos = computed(() => this.tiposServicio().length);
  protected readonly tiposActivos = computed(
    () => this.tiposServicio().filter((s) => s.activo).length
  );

  ngOnInit(): void {
    this.cargarTecnicos();
    this.cargarTiposServicio();
  }

  cargarTecnicos(): void {
    this.cargandoTecnicos.set(true);
    this.catalogos.listarTecnicos().subscribe({
      next: (data) => {
        this.tecnicos.set(data);
        this.cargandoTecnicos.set(false);
      },
      error: (err) => {
        this.cargandoTecnicos.set(false);
        this.toast.errorApi(err);
      },
    });
  }

  cargarTiposServicio(): void {
    this.cargandoTipos.set(true);
    this.catalogos.listarTiposServicio().subscribe({
      next: (data) => {
        this.tiposServicio.set(data);
        this.cargandoTipos.set(false);
      },
      error: (err) => {
        this.cargandoTipos.set(false);
        this.toast.errorApi(err);
      },
    });
  }

  limpiarFiltrosTecnicos(): void {
    this.busquedaTecnicos.set('');
    this.estadoTecnicos.set(null);
  }

  limpiarFiltrosTipos(): void {
    this.busquedaTipos.set('');
    this.estadoTipos.set(null);
  }

  cambiarTab(valor: string | number | undefined): void {
    if (valor !== undefined) {
      this.tabActiva.set(valor);
    }
  }

  async copiarTexto(texto: string, etiqueta: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(texto);
      this.toast.success('Copiado', `${etiqueta} copiado al portapapeles.`);
    } catch {
      this.toast.warn('No se pudo copiar automáticamente.');
    }
  }
}

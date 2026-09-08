import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import type {
  EstadoSolicitud,
  Prioridad,
  SolicitudesFiltros,
  Tecnico,
  TipoServicio,
} from '../models/solicitud';

const ESTADOS: EstadoSolicitud[] = ['PENDIENTE', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA', 'CANCELADA'];
const PRIORIDADES: Prioridad[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

/** Filtros del listado. Dumb: emite cambios, no conoce el store. */
@Component({
  selector: 'ti-solicitudes-filtros',
  imports: [FormsModule, Button, InputText, Select],
  templateUrl: './solicitudes-filtros.html',
  styleUrl: './solicitudes-filtros.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesFiltrosPanel {
  readonly filtros = input.required<SolicitudesFiltros>();
  readonly tecnicos = input<Tecnico[]>([]);
  readonly tipos = input<TipoServicio[]>([]);
  readonly cambio = output<Partial<SolicitudesFiltros>>();
  readonly limpiar = output<void>();

  protected readonly estados = ESTADOS;
  protected readonly prioridades = PRIORIDADES;
  protected readonly busqueda$ = new Subject<string>();

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.busqueda$
      .pipe(debounceTime(400), takeUntilDestroyed(destroyRef))
      .subscribe((busqueda) => this.cambio.emit({ busqueda: busqueda.trim() ? busqueda.trim() : undefined }));
  }
}

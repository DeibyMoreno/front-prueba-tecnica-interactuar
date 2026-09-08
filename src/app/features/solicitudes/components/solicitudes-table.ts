import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { EstadoSeverity } from '../../../shared/pipes/estado-severity';
import {
  puedeAsignar,
  puedeDesasignar,
  puedeEditar,
  puedeEliminar,
  TRANSICIONES,
  type EstadoSolicitud,
  type Solicitud,
} from '../models/solicitud';

export interface PaginaEvento {
  readonly pagina: number;
  readonly limite: number;
}

/** Tabla de solicitudes. Dumb: solo presenta, emite paginación y acciones. */
@Component({
  selector: 'ti-solicitudes-table',
  imports: [DatePipe, Button, Paginator, TableModule, Tag, EstadoSeverity],
  templateUrl: './solicitudes-table.html',
  styleUrl: './solicitudes-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesTable {
  readonly items = input<Solicitud[]>([]);
  readonly total = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly pagina = input<number>(1);
  readonly limite = input<number>(10);
  readonly paginaCambio = output<PaginaEvento>();
  readonly ver = output<Solicitud>();
  readonly editar = output<Solicitud>();
  readonly asignar = output<Solicitud>();
  readonly desasignar = output<Solicitud>();
  readonly cambiarEstado = output<Solicitud>();
  readonly eliminar = output<Solicitud>();

  protected readonly puedeEditar = puedeEditar;
  protected readonly puedeAsignar = puedeAsignar;
  protected readonly puedeDesasignar = puedeDesasignar;
  protected readonly puedeEliminar = puedeEliminar;
  protected tieneDestinos(estado: EstadoSolicitud): boolean {
    return TRANSICIONES[estado].length > 0;
  }

  protected onPagina(event: PaginatorState): void {
    this.paginaCambio.emit({ pagina: (event.page ?? 0) + 1, limite: event.rows ?? 10 });
  }
}

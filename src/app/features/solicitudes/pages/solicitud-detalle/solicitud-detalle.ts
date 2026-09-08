import { ChangeDetectionStrategy, Component, computed, inject, input, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Toast } from '../../../../core/services/toast';
import { PageHeader } from '../../../../shared/components/page-header';
import { EstadoSeverity } from '../../../../shared/pipes/estado-severity';
import { Catalogos } from '../../../catalogos/services/catalogos';
import {
  puedeAsignar,
  puedeDesasignar,
  puedeEditar,
  puedeEliminar,
  TRANSICIONES,
  type CambiarEstado,
  type EstadoSolicitud,
  type SolicitudDetalle as Detalle,
  type Tecnico,
} from '../../models/solicitud';
import { SolicitudesStore } from '../../services/solicitudes';
import { AsignarDialog } from '../../components/asignar-dialog/asignar-dialog';
import { CambiarEstadoDialog } from '../../components/cambiar-estado-dialog/cambiar-estado-dialog';
import { EstadoTimeline } from '../../components/estado-timeline/estado-timeline';

/** Detalle de solicitud con historial y acciones de estado. Smart. */
@Component({
  selector: 'ti-solicitud-detalle',
  imports: [
    DatePipe,
    Button,
    Card,
    Skeleton,
    Tag,
    PageHeader,
    EstadoSeverity,
    EstadoTimeline,
    AsignarDialog,
    CambiarEstadoDialog,
  ],
  templateUrl: './solicitud-detalle.html',
  styleUrl: './solicitud-detalle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudDetalle {
  readonly id = input.required<number>();

  private readonly store = inject(SolicitudesStore);
  private readonly catalogos = inject(Catalogos);
  private readonly toast = inject(Toast);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);

  protected readonly detalle = resource<Detalle, number>({
    params: () => this.id(),
    loader: ({ params: id }) => this.store.detalle(id),
  });

  protected readonly tecnicos = toSignal(
    this.catalogos.tecnicos().pipe(
      map((t) => [...t]),
      catchError(() => of([] as Tecnico[])),
    ),
    { initialValue: [] as Tecnico[] },
  );

  protected readonly historial = computed(() => [...(this.detalle.value()?.historial ?? [])]);
  protected readonly estado = computed(() => this.detalle.value()?.estado ?? null);
  protected readonly editable = computed(() => {
    const estado = this.estado();
    return estado ? puedeEditar(estado) : false;
  });
  protected readonly asignable = computed(() => {
    const estado = this.estado();
    return estado ? puedeAsignar(estado) : false;
  });
  protected readonly desasignable = computed(() => {
    const estado = this.estado();
    return estado ? puedeDesasignar(estado) : false;
  });
  protected readonly eliminable = computed(() => {
    const estado = this.estado();
    return estado ? puedeEliminar(estado) : false;
  });
  protected readonly tieneDestinos = computed(() => {
    const estado = this.estado();
    return estado ? TRANSICIONES[estado].length > 0 : false;
  });

  protected readonly mostrarAsignar = signal(false);
  protected readonly asignandoEnCurso = signal(false);
  protected readonly mostrarEstado = signal(false);
  protected readonly cambiandoEnCurso = signal(false);

  protected recargar(): void {
    this.detalle.reload();
  }

  protected irALista(): void {
    void this.router.navigate(['/solicitudes']);
  }

  protected async onAsignar(tecnicoId: number): Promise<void> {
    const s = this.detalle.value();
    if (!s) return;
    this.asignandoEnCurso.set(true);
    try {
      await this.store.asignar(s.id, tecnicoId);
      this.toast.success('Técnico asignado', `${s.codigo} → ASIGNADA`);
      this.mostrarAsignar.set(false);
      this.detalle.reload();
    } finally {
      this.asignandoEnCurso.set(false);
    }
  }

  protected async desasignar(): Promise<void> {
    const s = this.detalle.value();
    if (!s) return;
    try {
      await this.store.desasignar(s.id);
      this.toast.success('Técnico desasignado', `${s.codigo} → PENDIENTE`);
      this.detalle.reload();
    } catch {
      // El interceptor ya mostró el toast.
    }
  }

  protected async onCambiarEstado(cambio: CambiarEstado): Promise<void> {
    const s = this.detalle.value();
    if (!s) return;
    this.cambiandoEnCurso.set(true);
    try {
      const actualizada = await this.store.cambiarEstado(s.id, cambio);
      this.toast.success('Estado actualizado', `${s.codigo} → ${actualizada.estado}`);
      this.mostrarEstado.set(false);
      this.detalle.reload();
    } finally {
      this.cambiandoEnCurso.set(false);
    }
  }

  protected eliminar(): void {
    const s = this.detalle.value();
    if (!s) return;
    this.confirm.confirm({
      message: `¿Eliminar ${s.codigo}? Solo es posible en PENDIENTE o CANCELADA.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        void this.store.eliminar(s.id).then(() => {
          this.toast.success('Solicitud eliminada', s.codigo);
          this.irALista();
        });
      },
    });
  }
}

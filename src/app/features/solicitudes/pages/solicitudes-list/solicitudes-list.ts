import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Button } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { Toast } from '../../../../core/services/toast';
import { isValidationError, type ApiError } from '../../../../core/models/api-error';
import { EmptyState } from '../../../../shared/components/empty-state';
import { PageHeader } from '../../../../shared/components/page-header';
import { Catalogos } from '../../../catalogos/services/catalogos';
import type {
  CambiarEstado,
  CrearSolicitud,
  EditarSolicitud,
  SolicitudesFiltros,
  Solicitud,
  Tecnico,
  TipoServicio,
} from '../../models/solicitud';
import { SolicitudesStore } from '../../services/solicitudes';
import { AsignarDialog } from '../../components/asignar-dialog/asignar-dialog';
import { CambiarEstadoDialog } from '../../components/cambiar-estado-dialog/cambiar-estado-dialog';
import { SolicitudForm } from '../../components/solicitud-form/solicitud-form';
import { SolicitudesFiltrosPanel } from '../../components/solicitudes-filtros';
import { PaginaEvento, SolicitudesTable } from '../../components/solicitudes-table';

/** Lista de solicitudes. Smart: orquesta store + catálogos + router. */
@Component({
  selector: 'ti-solicitudes-list',
  imports: [
    Button,
    EmptyState,
    PageHeader,
    SolicitudForm,
    SolicitudesFiltrosPanel,
    SolicitudesTable,
    AsignarDialog,
    CambiarEstadoDialog,
  ],
  templateUrl: './solicitudes-list.html',
  styleUrl: './solicitudes-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolicitudesList implements OnInit {
  protected readonly store = inject(SolicitudesStore);
  private readonly catalogos = inject(Catalogos);
  private readonly toast = inject(Toast);
  private readonly confirm = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formRef = viewChild(SolicitudForm);

  protected readonly dialogoVisible = signal(false);
  protected readonly editando = signal<Solicitud | null>(null);
  protected readonly guardando = signal(false);
  protected readonly asignando = signal<Solicitud | null>(null);
  protected readonly asignandoEnCurso = signal(false);
  protected readonly cambiandoEstado = signal<Solicitud | null>(null);
  protected readonly cambiandoEnCurso = signal(false);

  protected readonly tecnicos = toSignal(
    this.catalogos.tecnicos().pipe(
      map((t) => [...t]),
      catchError(() => of([] as Tecnico[])),
    ),
    { initialValue: [] as Tecnico[] },
  );
  protected readonly tipos = toSignal(
    this.catalogos.tiposServicio().pipe(
      map((t) => [...t]),
      catchError(() => of([] as TipoServicio[])),
    ),
    { initialValue: [] as TipoServicio[] },
  );
  protected readonly datos = computed(() => [...(this.store.lista.value()?.data ?? [])]);
  protected readonly total = computed(() => this.store.lista.value()?.meta?.total ?? 0);
  protected readonly vacio = computed(() => !this.store.lista.isLoading() && this.datos().length === 0);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.store.filtros.set({
      estado: params['estado'] ?? undefined,
      prioridad: params['prioridad'] ?? undefined,
      tecnicoId: params['tecnicoId'] ? Number(params['tecnicoId']) : undefined,
      tipoServicioId: params['tipoServicioId'] ? Number(params['tipoServicioId']) : undefined,
      busqueda: params['busqueda'] ?? undefined,
      pagina: params['pagina'] ? Number(params['pagina']) : 1,
      limite: params['limite'] ? Number(params['limite']) : 10,
    });
  }

  protected onFiltros(patch: Partial<SolicitudesFiltros>): void {
    this.store.setFiltros(patch);
    this.sincronizarUrl();
  }

  protected onPagina(event: PaginaEvento): void {
    this.store.filtros.update((f) => ({ ...f, pagina: event.pagina, limite: event.limite }));
    this.sincronizarUrl();
  }

  protected onLimpiar(): void {
    this.store.filtros.set({ pagina: 1, limite: 10 });
    this.sincronizarUrl();
  }

  protected verDetalle(solicitud: Solicitud): void {
    void this.router.navigate(['/solicitudes', solicitud.id]);
  }

  protected abrirAsignar(solicitud: Solicitud): void {
    if (solicitud.estado !== 'PENDIENTE') {
      this.toast.warn('Solo se puede asignar en estado PENDIENTE', solicitud.codigo);
      return;
    }
    this.asignando.set(solicitud);
  }

  protected async onAsignar(tecnicoId: number): Promise<void> {
    const solicitud = this.asignando();
    if (!solicitud) return;
    this.asignandoEnCurso.set(true);
    try {
      const actualizada = await this.store.asignar(solicitud.id, tecnicoId);
      this.toast.success('Técnico asignado', `${actualizada.codigo} → ASIGNADA`);
      this.asignando.set(null);
      this.store.recargar();
    } finally {
      this.asignandoEnCurso.set(false);
    }
  }

  protected async desasignar(solicitud: Solicitud): Promise<void> {
    try {
      const actualizada = await this.store.desasignar(solicitud.id);
      this.toast.success('Técnico desasignado', `${actualizada.codigo} → PENDIENTE`);
      this.store.recargar();
    } catch {
      // El interceptor ya mostró el toast (p. ej. CONFLICTO si salió de ASIGNADA).
    }
  }

  protected abrirCambiarEstado(solicitud: Solicitud): void {
    this.cambiandoEstado.set(solicitud);
  }

  protected async onCambiarEstado(cambio: CambiarEstado): Promise<void> {
    const solicitud = this.cambiandoEstado();
    if (!solicitud) return;
    this.cambiandoEnCurso.set(true);
    try {
      const actualizada = await this.store.cambiarEstado(solicitud.id, cambio);
      this.toast.success('Estado actualizado', `${actualizada.codigo} → ${actualizada.estado}`);
      this.cambiandoEstado.set(null);
      this.store.recargar();
    } finally {
      this.cambiandoEnCurso.set(false);
    }
  }

  protected eliminar(solicitud: Solicitud): void {
    this.confirm.confirm({
      message: `¿Eliminar ${solicitud.codigo}? Solo es posible en PENDIENTE o CANCELADA.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        void this.store.eliminar(solicitud.id).then(() => {
          this.toast.success('Solicitud eliminada', solicitud.codigo);
          this.store.recargar();
        });
      },
    });
  }

  protected nueva(): void {
    this.editando.set(null);
    this.dialogoVisible.set(true);
  }

  protected editarSolicitud(solicitud: Solicitud): void {
    if (solicitud.estado !== 'PENDIENTE') {
      this.toast.warn('Solo se puede editar en estado PENDIENTE', solicitud.codigo);
      return;
    }
    this.editando.set(solicitud);
    this.dialogoVisible.set(true);
  }

  protected async onGuardar(dto: CrearSolicitud | EditarSolicitud): Promise<void> {
    const editando = this.editando();
    this.guardando.set(true);
    try {
      if (editando) {
        const actualizada = await this.store.editar(editando.id, dto as EditarSolicitud);
        this.toast.success('Solicitud actualizada', actualizada.codigo);
      } else {
        const creada = await this.store.crear(dto as CrearSolicitud);
        this.toast.success('Solicitud creada', `${creada.codigo} quedó en PENDIENTE`);
      }
      this.dialogoVisible.set(false);
      this.editando.set(null);
      this.store.recargar();
    } catch (error) {
      const apiError = error as ApiError;
      if (isValidationError(apiError)) {
        this.formRef()?.setErroresServidor(apiError.detalles);
      }
    } finally {
      this.guardando.set(false);
    }
  }

  private sincronizarUrl(): void {
    const f = this.store.filtros();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        estado: f.estado ?? null,
        prioridad: f.prioridad ?? null,
        tecnicoId: f.tecnicoId ?? null,
        tipoServicioId: f.tipoServicioId ?? null,
        busqueda: f.busqueda ?? null,
        pagina: f.pagina !== 1 ? f.pagina : null,
        limite: f.limite !== 10 ? f.limite : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}

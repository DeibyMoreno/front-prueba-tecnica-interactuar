import { Injectable, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Api } from '../../../core/services/api';
import type {
  CambiarEstado,
  CrearSolicitud,
  EditarSolicitud,
  Pagina,
  Solicitud,
  SolicitudDetalle,
  SolicitudesFiltros,
} from '../models/solicitud';

@Injectable({ providedIn: 'root' })
export class SolicitudesStore {
  private readonly api = inject(Api);

  readonly filtros = signal<SolicitudesFiltros>({ pagina: 1, limite: 10 });

  private readonly query = () => toQueryParams(this.filtros());
  readonly lista = httpResource<Pagina<Solicitud>>(() => ({
    url: `${environment.apiUrl}/solicitudes`,
    params: this.query(),
  }));

  recargar(): void {
    this.lista.reload();
  }

  setFiltros(patch: Partial<SolicitudesFiltros>): void {
    this.filtros.update((f) => ({ ...f, ...patch, pagina: patch.pagina ?? 1 }));
  }

  setPagina(pagina: number): void {
    this.filtros.update((f) => ({ ...f, pagina }));
  }

  detalle(id: number): Promise<SolicitudDetalle> {
    return firstValueFrom(this.api.get<SolicitudDetalle>(`/solicitudes/${id}`));
  }

  crear(dto: CrearSolicitud): Promise<Solicitud> {
    return firstValueFrom(this.api.post<Solicitud, CrearSolicitud>('/solicitudes', dto));
  }

  editar(id: number, dto: EditarSolicitud): Promise<Solicitud> {
    return firstValueFrom(this.api.patch<Solicitud, EditarSolicitud>(`/solicitudes/${id}`, dto));
  }

  eliminar(id: number): Promise<void> {
    return firstValueFrom(this.api.delete(`/solicitudes/${id}`));
  }

  asignar(id: number, tecnicoId: number): Promise<Solicitud> {
    return firstValueFrom(this.api.patch<Solicitud, { tecnicoId: number }>(`/solicitudes/${id}/asignar`, { tecnicoId }));
  }

  desasignar(id: number): Promise<Solicitud> {
    return firstValueFrom(this.api.patch<Solicitud, Record<string, never>>(`/solicitudes/${id}/desasignar`, {}));
  }

  cambiarEstado(id: number, cambio: CambiarEstado): Promise<Solicitud> {
    return firstValueFrom(this.api.patch<Solicitud, CambiarEstado>(`/solicitudes/${id}/estado`, cambio));
  }
}

function toQueryParams(f: SolicitudesFiltros): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (f.estado) params['estado'] = f.estado;
  if (f.prioridad) params['prioridad'] = f.prioridad;
  if (f.tecnicoId) params['tecnicoId'] = f.tecnicoId;
  if (f.tipoServicioId) params['tipoServicioId'] = f.tipoServicioId;
  if (f.busqueda?.trim() && f.busqueda.trim().length >= 2) params['busqueda'] = f.busqueda.trim();
  params['pagina'] = f.pagina ?? 1;
  params['limite'] = Math.min(f.limite ?? 10, 50);
  return params;
}

/** Modelos espejo de `docs/openapi.yaml`. Los DTO usan `import type` en el resto del código. */

export type EstadoSolicitud =
  | 'PENDIENTE'
  | 'ASIGNADA'
  | 'EN_PROCESO'
  | 'RESUELTA'
  | 'CERRADA'
  | 'CANCELADA';

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type EstadoDestino = 'EN_PROCESO' | 'RESUELTA' | 'CERRADA' | 'CANCELADA';

export interface Tecnico {
  readonly id: number;
  readonly nombreCompleto: string;
  readonly documento: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly activo: boolean;
}

export interface TipoServicio {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly activo: boolean;
}

export interface Solicitud {
  readonly id: number;
  readonly codigo: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly solicitanteNombre: string;
  readonly solicitanteEmail: string;
  readonly solicitanteArea: string | null;
  readonly estado: EstadoSolicitud;
  readonly prioridad: Prioridad;
  readonly fechaSolicitud: string;
  readonly fechaAsignacion: string | null;
  readonly fechaCierre: string | null;
  readonly tipoServicio: { readonly id: number; readonly nombre: string } | null;
  readonly tecnico: { readonly id: number; readonly nombreCompleto: string } | null;
}

export interface SolicitudHistorial {
  readonly id: number;
  readonly estadoAnterior: EstadoSolicitud | null;
  readonly estadoNuevo: EstadoSolicitud;
  readonly comentario: string | null;
  readonly registradoEn: string;
}

export interface SolicitudDetalle extends Solicitud {
  readonly historial: readonly SolicitudHistorial[];
}

export interface PaginaMeta {
  readonly pagina: number;
  readonly limite: number;
  readonly total: number;
}

export interface Pagina<T> {
  readonly data: readonly T[];
  readonly meta: PaginaMeta;
}

export interface CrearSolicitud {
  readonly titulo: string;
  readonly descripcion: string;
  readonly solicitanteNombre: string;
  readonly solicitanteEmail: string;
  readonly solicitanteArea?: string;
  readonly tipoServicioId: number;
  readonly prioridad?: Prioridad;
}

export interface EditarSolicitud {
  readonly titulo?: string;
  readonly descripcion?: string;
  readonly solicitanteNombre?: string;
  readonly solicitanteEmail?: string;
  readonly solicitanteArea?: string;
  readonly tipoServicioId?: number;
  readonly prioridad?: Prioridad;
}

export interface CambiarEstado {
  readonly estado: EstadoDestino;
  readonly comentario?: string;
}

export interface SolicitudesFiltros {
  readonly estado?: EstadoSolicitud;
  readonly prioridad?: Prioridad;
  readonly tecnicoId?: number;
  readonly tipoServicioId?: number;
  readonly busqueda?: string;
  readonly pagina?: number;
  readonly limite?: number;
}

/** Destinos permitidos por estado (evita 409 antes de llamar al API). */
export const TRANSICIONES: Readonly<Record<EstadoSolicitud, readonly EstadoDestino[]>> = {
  PENDIENTE: [],
  ASIGNADA: ['EN_PROCESO', 'CANCELADA'],
  EN_PROCESO: ['RESUELTA', 'CANCELADA'],
  RESUELTA: ['CERRADA'],
  CERRADA: [],
  CANCELADA: [],
};

export function puedeTransitar(origen: EstadoSolicitud, destino: EstadoDestino): boolean {
  return TRANSICIONES[origen].includes(destino);
}

/** PENDIENTE solo admite asignar o cancelar (endpoints dedicados, no /estado). */
export function puedeAsignar(estado: EstadoSolicitud): boolean {
  return estado === 'PENDIENTE';
}

export function puedeDesasignar(estado: EstadoSolicitud): boolean {
  return estado === 'ASIGNADA';
}

export function puedeEditar(estado: EstadoSolicitud): boolean {
  return estado === 'PENDIENTE';
}

export function puedeEliminar(estado: EstadoSolicitud): boolean {
  return estado === 'PENDIENTE' || estado === 'CANCELADA';
}

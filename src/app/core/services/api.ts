import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiError, ApiErrorCodigo, ApiErrorDetalle } from '../models/api-error';

interface Envelope<T> {
  data: T;
}

interface ErrorEnvelope {
  error?: { codigo?: string; mensaje?: string; detalles?: ApiErrorDetalle[] };
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/** Único punto de acceso HTTP. Desenvuelve `{ data }` y normaliza `{ error }` a `ApiError`. */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<Envelope<T>>(this.url(path), { params: toHttpParams(params) })
      .pipe(map((res) => res.data), catchError((e) => throwError(() => toApiError(e))));
  }

  post<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http
      .post<Envelope<T>>(this.url(path), body)
      .pipe(map((res) => res.data), catchError((e) => throwError(() => toApiError(e))));
  }

  patch<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http
      .patch<Envelope<T>>(this.url(path), body)
      .pipe(map((res) => res.data), catchError((e) => throwError(() => toApiError(e))));
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(this.url(path)).pipe(catchError((e) => throwError(() => toApiError(e))));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

function toHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams();
  if (!params) return httpParams;
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    httpParams = httpParams.set(key, String(value));
  }
  return httpParams;
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return { codigo: 'RED', mensaje: 'Servicio no disponible. Verifica tu conexión.', detalles: [], status: 0 };
    }
    const payload = err.error as ErrorEnvelope | undefined;
    const codigo = normalizeCodigo(payload?.error?.codigo, err.status);
    return {
      codigo,
      mensaje: payload?.error?.mensaje ?? mensajePorDefecto(err.status),
      detalles: payload?.error?.detalles ?? [],
      status: err.status,
    };
  }
  return { codigo: 'DESCONOCIDO', mensaje: 'Error inesperado.', detalles: [], status: -1 };
}

function normalizeCodigo(codigo: string | undefined, status: number): ApiErrorCodigo {
  const validas: ApiErrorCodigo[] = ['VALIDACION', 'NO_ENCONTRADO', 'CONFLICTO', 'JSON_INVALIDO', 'ERROR_INTERNO'];
  if (codigo && (validas as string[]).includes(codigo)) return codigo as ApiErrorCodigo;
  if (status === 404) return 'NO_ENCONTRADO';
  if (status === 409) return 'CONFLICTO';
  if (status === 400) return 'VALIDACION';
  return 'DESCONOCIDO';
}

function mensajePorDefecto(status: number): string {
  if (status === 404) return 'Recurso no encontrado.';
  if (status === 409) return 'La operación no es compatible con el estado actual.';
  if (status >= 500) return 'Error interno del servidor. Intenta de nuevo.';
  return 'La solicitud no pudo completarse.';
}

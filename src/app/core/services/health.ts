import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Api } from './api';

export type HealthEstado = 'conectada' | 'desconectada' | 'cargando';

interface HealthData {
  baseDatos?: string;
}

/** Consulta `GET /health` para el badge del shell. Nunca lanza: retorna estado. */
@Injectable({ providedIn: 'root' })
export class Health {
  private readonly api = inject(Api);

  estado(): Observable<HealthEstado> {
    return this.api.get<HealthData>('/health').pipe(
      map((data) => (data.baseDatos === 'conectada' ? 'conectada' : 'desconectada') as HealthEstado),
      catchError(() => of<HealthEstado>('desconectada')),
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Api } from '../../../core/services/api';
import type { Tecnico, TipoServicio } from '../../solicitudes/models/solicitud';

/**
 * Catálogos de solo lectura (`tecnicos`, `tipos-servicio`).
 * Alimentan los `<select>` del formulario. Cacheados: el yaml los define estáticos.
 */
@Injectable({ providedIn: 'root' })
export class Catalogos {
  private readonly api = inject(Api);
  private tecnicosCache?: Observable<readonly Tecnico[]>;
  private tiposCache?: Observable<readonly TipoServicio[]>;

  tecnicos(busqueda?: string): Observable<readonly Tecnico[]> {
    if (busqueda?.trim()) {
      return this.api.get<readonly Tecnico[]>('/tecnicos', { activo: 'true', busqueda: busqueda.trim() });
    }
    if (!this.tecnicosCache) {
      this.tecnicosCache = this.api.get<readonly Tecnico[]>('/tecnicos', { activo: 'true' }).pipe(shareReplay(1));
    }
    return this.tecnicosCache;
  }

  listarTecnicos(filtros?: { activo?: boolean | string; busqueda?: string }): Observable<readonly Tecnico[]> {
    const params: Record<string, string | undefined> = {};
    if (filtros?.activo !== undefined && filtros?.activo !== '') {
      params['activo'] = String(filtros.activo);
    }
    if (filtros?.busqueda?.trim()) {
      params['busqueda'] = filtros.busqueda.trim();
    }
    return this.api.get<readonly Tecnico[]>('/tecnicos', params);
  }

  tiposServicio(): Observable<readonly TipoServicio[]> {
    if (!this.tiposCache) {
      this.tiposCache = this.api
        .get<readonly TipoServicio[]>('/tipos-servicio', { activo: 'true' })
        .pipe(shareReplay(1));
    }
    return this.tiposCache;
  }

  listarTiposServicio(filtros?: { activo?: boolean | string; busqueda?: string }): Observable<readonly TipoServicio[]> {
    const params: Record<string, string | undefined> = {};
    if (filtros?.activo !== undefined && filtros?.activo !== '') {
      params['activo'] = String(filtros.activo);
    }
    if (filtros?.busqueda?.trim()) {
      params['busqueda'] = filtros.busqueda.trim();
    }
    return this.api.get<readonly TipoServicio[]>('/tipos-servicio', params);
  }
}


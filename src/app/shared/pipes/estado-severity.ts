import { Pipe, PipeTransform } from '@angular/core';

export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

/** Severidades de `p-tag` para estados y prioridades (puro, testeable). */
@Pipe({ name: 'estadoSeverity', standalone: true })
export class EstadoSeverity implements PipeTransform {
  transform(value: string | undefined | null): TagSeverity {
    switch (value) {
      case 'RESUELTA':
      case 'CERRADA':
        return 'success';
      case 'EN_PROCESO':
      case 'ASIGNADA':
        return 'info';
      case 'PENDIENTE':
      case 'MEDIA':
      case 'ALTA':
        return 'warn';
      case 'CANCELADA':
      case 'CRITICA':
        return 'danger';
      case 'BAJA':
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}

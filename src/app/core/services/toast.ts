import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import type { ApiError } from '../models/api-error';

/** Wrapper fino de PrimeNG Toast con mensajes amigables. */
@Injectable({ providedIn: 'root' })
export class Toast {
  private readonly messages = inject(MessageService);

  success(titulo: string, detalle?: string): void {
    this.messages.add({ severity: 'success', summary: titulo, detail: detalle, life: 4000 });
  }

  warn(titulo: string, detalle?: string): void {
    this.messages.add({ severity: 'warn', summary: titulo, detail: detalle, life: 5000 });
  }

  error(titulo: string, detalle?: string): void {
    this.messages.add({ severity: 'error', summary: titulo, detail: detalle, life: 6000 });
  }

  errorApi(error: ApiError): void {
    switch (error.codigo) {
      case 'VALIDACION': {
        const primero = error.detalles[0]?.mensaje;
        this.warn('Revisa el formulario', primero ?? error.mensaje);
        break;
      }
      case 'CONFLICTO':
        this.error('Operación no permitida', error.mensaje);
        break;
      case 'NO_ENCONTRADO':
        this.warn('No encontrado', error.mensaje);
        break;
      case 'RED':
        this.error('Sin conexión con el servidor', error.mensaje);
        break;
      default:
        this.error('Ocurrió un error', error.mensaje);
    }
  }
}

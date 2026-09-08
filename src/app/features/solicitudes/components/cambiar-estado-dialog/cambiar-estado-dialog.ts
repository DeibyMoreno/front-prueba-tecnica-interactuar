import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { TRANSICIONES, type CambiarEstado, type EstadoDestino, type EstadoSolicitud } from '../../models/solicitud';

/** Diálogo para avanzar estado. Dumb: destinos filtrados, comentario obligatorio si CANCELADA. */
@Component({
  selector: 'ti-cambiar-estado-dialog',
  imports: [FormsModule, Button, Dialog, Message, Select, Textarea],
  templateUrl: './cambiar-estado-dialog.html',
  styleUrl: './cambiar-estado-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CambiarEstadoDialog {
  readonly visible = model<boolean>(false);
  readonly estadoActual = input<EstadoSolicitud>('PENDIENTE');
  readonly saving = input<boolean>(false);
  readonly cambiar = output<CambiarEstado>();

  protected readonly destinos = computed<EstadoDestino[]>(() => [...TRANSICIONES[this.estadoActual()]]);
  protected readonly destino = signal<EstadoDestino | null>(null);
  protected readonly comentario = signal<string>('');
  protected readonly exigeComentario = computed(() => this.destino() === 'CANCELADA');
  protected readonly valido = computed(() => {
    if (!this.destino()) return false;
    if (this.exigeComentario()) return this.comentario().trim().length > 0;
    return true;
  });

  protected onCambiar(): void {
    const destino = this.destino();
    if (!destino || !this.valido()) return;
    const comentario = this.comentario().trim();
    this.cambiar.emit(destino === 'CANCELADA' ? { estado: destino, comentario } : { estado: destino });
    this.destino.set(null);
    this.comentario.set('');
  }
}

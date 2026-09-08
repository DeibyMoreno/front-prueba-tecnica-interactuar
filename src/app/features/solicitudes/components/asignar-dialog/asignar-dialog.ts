import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import type { Tecnico } from '../../models/solicitud';

/** Diálogo para asignar técnico (PENDIENTE → ASIGNADA). Dumb. */
@Component({
  selector: 'ti-asignar-dialog',
  imports: [FormsModule, Button, Dialog, Select],
  templateUrl: './asignar-dialog.html',
  styleUrl: './asignar-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignarDialog {
  readonly visible = model<boolean>(false);
  readonly tecnicos = input<Tecnico[]>([]);
  readonly saving = input<boolean>(false);
  readonly asignar = output<number>();

  protected readonly tecnicoId = signal<number | null>(null);
  protected readonly valido = computed(() => (this.tecnicoId() ?? 0) >= 1);

  protected onAsignar(): void {
    const id = this.tecnicoId();
    if (id) {
      this.asignar.emit(id);
      this.tecnicoId.set(null);
    }
  }
}

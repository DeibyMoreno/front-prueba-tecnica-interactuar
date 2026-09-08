import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';

/** Estado vacío reutilizable (listas sin resultados). */
@Component({
  selector: 'ti-empty-state',
  imports: [Button],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>('');
  readonly accionTexto = input<string>('');
  readonly accion = output<void>();
}

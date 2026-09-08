import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Encabezado de página reutilizable (2+ features). */
@Component({
  selector: 'ti-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>('');
}

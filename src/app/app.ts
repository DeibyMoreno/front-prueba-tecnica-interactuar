import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Shell } from './core/layout/shell';

@Component({
  selector: 'ti-root',
  imports: [Shell],
  template: `<ti-shell />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

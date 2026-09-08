import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Tag } from 'primeng/tag';
import { Toast as ToastUI } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Health } from '../services/health';

@Component({
  selector: 'ti-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Drawer, Tag, ToastUI, ConfirmDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly health = inject(Health);
  protected readonly salud = toSignal(this.health.estado(), { initialValue: 'cargando' as const });
  protected readonly menuAbierto = signal(false);
}

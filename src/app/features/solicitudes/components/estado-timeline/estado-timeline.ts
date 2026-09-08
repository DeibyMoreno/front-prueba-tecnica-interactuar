import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tag } from 'primeng/tag';
import { Timeline } from 'primeng/timeline';
import { EstadoSeverity } from '../../../../shared/pipes/estado-severity';
import type { SolicitudHistorial } from '../../models/solicitud';

const ICONOS_POR_ESTADO: Readonly<Record<string, string>> = {
  PENDIENTE: 'pi-clock',
  ASIGNADA: 'pi-user-plus',
  EN_PROCESO: 'pi-cog',
  RESUELTA: 'pi-check-circle',
  CERRADA: 'pi-lock',
  CANCELADA: 'pi-times-circle',
};

/** Timeline vertical del historial de estados. Dumb: solo presenta. */
@Component({
  selector: 'ti-estado-timeline',
  imports: [DatePipe, Tag, Timeline, EstadoSeverity],
  templateUrl: './estado-timeline.html',
  styleUrls: ['./estado-timeline.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoTimeline {
  readonly historial = input<SolicitudHistorial[]>([]);

  /** Último movimiento = estado actual; se destaca sobre los anteriores. */
  protected readonly ultimo = computed(() => {
    const h = this.historial();
    return h.length > 0 ? h[h.length - 1] : null;
  });

  protected iconoPara(estado: string): string {
    return ICONOS_POR_ESTADO[estado] ?? 'pi-circle';
  }
}
